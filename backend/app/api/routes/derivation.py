"""Derivation search and step trace endpoints."""

from fastapi import APIRouter, HTTPException
from ...core.grammar_parser import parse_grammar_text, GrammarParseError
from ...core.derivation_engine import find_derivation
from .grammar import get_grammar_from_payload
from ..schemas.models import (
    DerivationSearchRequest,
    DerivationSearchResponse,
)

router = APIRouter(prefix="/derivations", tags=["Derivations"])


@router.post("/search", response_model=DerivationSearchResponse)
def search_derivation(payload: DerivationSearchRequest):
    try:
        grammar = get_grammar_from_payload(payload.raw_text, payload.grammar)
    except GrammarParseError as e:
        return DerivationSearchResponse(
            success=False,
            status="INVALID_GRAMMAR",
            target_string=payload.target_string,
            derivation_mode=payload.mode,
            message=f"Grammar parse error: {str(e)}",
        )
    except Exception as e:
        return DerivationSearchResponse(
            success=False,
            status="ERROR",
            target_string=payload.target_string,
            derivation_mode=payload.mode,
            message=str(e),
        )

    res = find_derivation(
        grammar=grammar,
        target=payload.target_string,
        mode=payload.mode,
        max_depth=payload.max_depth,
        max_configurations=payload.max_configurations,
    )
    return DerivationSearchResponse(**res.to_dict())
