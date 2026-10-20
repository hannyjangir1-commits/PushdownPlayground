"""CYK parsing route."""

from fastapi import APIRouter
from ...core.grammar_parser import GrammarParseError
from ...core.cnf_converter import convert_to_cnf, validate_cnf_grammar
from ...core.cyk_parser import run_cyk
from .grammar import get_grammar_from_payload
from ..schemas.models import CYKRunRequest, CYKRunResponse

router = APIRouter(prefix="/cyk", tags=["CYK Parser"])


@router.post("/run", response_model=CYKRunResponse)
def execute_cyk(payload: CYKRunRequest):
    try:
        grammar = get_grammar_from_payload(payload.raw_text, payload.grammar)

        is_cnf, errors = validate_cnf_grammar(grammar)
        if not is_cnf:
            if payload.convert_to_cnf_first:
                cnf_res = convert_to_cnf(grammar)
                if not cnf_res.success:
                    return CYKRunResponse(
                        success=False,
                        accepted=False,
                        input_string=payload.input_string,
                        tokens=[],
                        start_symbol=grammar.start_symbol,
                        message=f"Auto-CNF conversion failed: {'; '.join(cnf_res.validation_errors)}",
                    )
                grammar = cnf_res.cnf_grammar
            else:
                return CYKRunResponse(
                    success=False,
                    accepted=False,
                    input_string=payload.input_string,
                    tokens=[],
                    start_symbol=grammar.start_symbol,
                    message=f"Grammar is not in valid Chomsky Normal Form (CNF): {'; '.join(errors)}. Enable 'Convert to CNF First'.",
                )

        result = run_cyk(grammar, payload.input_string)
        data = result.to_dict()
        data["success"] = True
        return CYKRunResponse(**data)
    except GrammarParseError as e:
        return CYKRunResponse(
            success=False,
            accepted=False,
            input_string=payload.input_string,
            tokens=[],
            start_symbol="",
            message=f"Grammar parse error: {str(e)}",
        )
    except Exception as e:
        return CYKRunResponse(
            success=False,
            accepted=False,
            input_string=payload.input_string,
            tokens=[],
            start_symbol="",
            message=f"CYK execution error: {str(e)}",
        )
