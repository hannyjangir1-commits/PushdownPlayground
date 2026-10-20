"""Grammar management, parsing, validation, and sample library endpoints."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from ...core.grammar_model import Grammar, Production
from ...core.grammar_parser import parse_grammar_text, GrammarParseError
from ...core.grammar_validator import validate_and_analyze_grammar
from ...core.sample_data import SAMPLE_GRAMMARS
from ..schemas.models import (
    GrammarParseRequest,
    GrammarParseResponse,
    GrammarValidateResponse,
    GrammarSchema,
)

router = APIRouter(prefix="/grammar", tags=["Grammar"])


def get_grammar_from_payload(raw_text: str = None, grammar_data: GrammarSchema = None) -> Grammar:
    """Helper to reconstruct Grammar from either raw_text or GrammarSchema."""
    if grammar_data is not None:
        return Grammar.from_dict(grammar_data.model_dump())
    elif raw_text:
        return parse_grammar_text(raw_text)
    raise HTTPException(status_code=400, detail="Either 'raw_text' or 'grammar' object must be supplied.")


@router.post("/parse", response_model=GrammarParseResponse)
def parse_grammar(payload: GrammarParseRequest):
    try:
        grammar = parse_grammar_text(
            text=payload.raw_text,
            name=payload.name or "Grammar",
            description=payload.description or "",
            start_symbol_override=payload.start_symbol,
        )
        return GrammarParseResponse(
            success=True,
            data=GrammarSchema(**grammar.to_dict()),
        )
    except GrammarParseError as e:
        return GrammarParseResponse(
            success=False,
            error=str(e),
        )
    except Exception as e:
        return GrammarParseResponse(
            success=False,
            error=f"Unexpected parsing error: {str(e)}",
        )


@router.post("/validate", response_model=GrammarValidateResponse)
def validate_grammar(payload: GrammarParseRequest):
    try:
        grammar = parse_grammar_text(
            text=payload.raw_text,
            name=payload.name or "Grammar",
            start_symbol_override=payload.start_symbol,
        )
        analysis = validate_and_analyze_grammar(grammar)
        res_dict = analysis.to_dict()
        return GrammarValidateResponse(
            success=True,
            is_valid=res_dict["is_valid"],
            errors=res_dict["errors"],
            warnings=res_dict["warnings"],
            nullable_symbols=res_dict["nullable_symbols"],
            generating_symbols=res_dict["generating_symbols"],
            non_generating_symbols=res_dict["non_generating_symbols"],
            reachable_symbols=res_dict["reachable_symbols"],
            unreachable_symbols=res_dict["unreachable_symbols"],
            unit_productions=res_dict["unit_productions"],
            epsilon_productions=res_dict["epsilon_productions"],
            stats=res_dict["stats"],
        )
    except GrammarParseError as e:
        return GrammarValidateResponse(
            success=False,
            is_valid=False,
            errors=[str(e)],
        )
    except Exception as e:
        return GrammarValidateResponse(
            success=False,
            is_valid=False,
            errors=[f"Validation error: {str(e)}"],
        )


@router.get("/samples")
def list_sample_grammars():
    """Return preconfigured educational sample grammars."""
    return {"samples": SAMPLE_GRAMMARS}
