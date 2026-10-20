"""Batch testing workbench endpoint."""

from fastapi import APIRouter
from typing import List

from ...core.grammar_parser import parse_grammar_text, GrammarParseError
from ...core.cnf_converter import convert_to_cnf, validate_cnf_grammar
from ...core.cyk_parser import run_cyk
from ...core.pda_model import PDA
from ...core.pda_simulator import simulate_pda
from .grammar import get_grammar_from_payload
from .pda import get_pda_from_payload
from ..schemas.models import (
    BatchTestRequest,
    BatchTestResponse,
    BatchTestItemResult,
)

router = APIRouter(prefix="/tests", tags=["Batch Testing"])


@router.post("/batch", response_model=BatchTestResponse)
def run_batch_tests(payload: BatchTestRequest):
    results: List[BatchTestItemResult] = []

    if payload.model_type == "CFG":
        try:
            grammar = get_grammar_from_payload(payload.grammar_raw_text, payload.grammar)
        except Exception as e:
            return BatchTestResponse(
                success=False,
                model_type="CFG",
                total_tests=len(payload.test_items),
                passed_count=0,
                failed_count=len(payload.test_items),
                summary=f"Failed to parse grammar: {str(e)}",
            )

        # Ensure CNF
        is_cnf, _ = validate_cnf_grammar(grammar)
        if not is_cnf:
            if payload.convert_to_cnf:
                cnf_res = convert_to_cnf(grammar)
                if not cnf_res.success:
                    return BatchTestResponse(
                        success=False,
                        model_type="CFG",
                        total_tests=len(payload.test_items),
                        passed_count=0,
                        failed_count=len(payload.test_items),
                        summary="Grammar could not be converted to CNF for CYK testing.",
                    )
                grammar = cnf_res.cnf_grammar
            else:
                return BatchTestResponse(
                    success=False,
                    model_type="CFG",
                    total_tests=len(payload.test_items),
                    passed_count=0,
                    failed_count=len(payload.test_items),
                    summary="Grammar must be in CNF for CYK membership testing.",
                )

        passed = 0
        for item in payload.test_items:
            cyk_res = run_cyk(grammar, item.input_string)
            actual = cyk_res.accepted
            status = "ACCEPTED" if actual else "REJECTED"
            matched = (actual == item.expected) if item.expected is not None else None
            if matched is True or item.expected is None:
                passed += 1

            results.append(BatchTestItemResult(
                input_string=item.input_string,
                expected=item.expected,
                actual=actual,
                status=status,
                matched_expectation=matched,
                configurations_explored=len(cyk_res.steps),
                message=cyk_res.message,
            ))

        return BatchTestResponse(
            success=True,
            model_type="CFG",
            total_tests=len(payload.test_items),
            passed_count=passed,
            failed_count=len(payload.test_items) - passed,
            results=results,
            summary=f"Tested {len(payload.test_items)} strings using CYK dynamic programming.",
        )

    elif payload.model_type == "PDA":
        try:
            pda = get_pda_from_payload(payload.pda, payload.sample_id)
        except Exception as e:
            return BatchTestResponse(
                success=False,
                model_type="PDA",
                total_tests=len(payload.test_items),
                passed_count=0,
                failed_count=len(payload.test_items),
                summary=f"Failed to load PDA: {str(e)}",
            )

        passed = 0
        for item in payload.test_items:
            sim_res = simulate_pda(pda, item.input_string)
            actual = sim_res.accepted
            status = sim_res.status
            matched = (actual == item.expected) if item.expected is not None else None
            if matched is True or item.expected is None:
                passed += 1

            results.append(BatchTestItemResult(
                input_string=item.input_string,
                expected=item.expected,
                actual=actual,
                status=status,
                matched_expectation=matched,
                configurations_explored=sim_res.configurations_explored,
                message=sim_res.message,
            ))

        return BatchTestResponse(
            success=True,
            model_type="PDA",
            total_tests=len(payload.test_items),
            passed_count=passed,
            failed_count=len(payload.test_items) - passed,
            results=results,
            summary=f"Tested {len(payload.test_items)} strings with PDA simulator in mode {pda.acceptance_mode}.",
        )

    return BatchTestResponse(
        success=False,
        model_type=payload.model_type,
        total_tests=0,
        passed_count=0,
        failed_count=0,
        summary="Unsupported model type.",
    )
