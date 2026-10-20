"""Normal forms conversion routes (CNF & GNF)."""

from fastapi import APIRouter
from ...core.grammar_parser import GrammarParseError
from ...core.cnf_converter import convert_to_cnf
from ...core.gnf_converter import convert_to_gnf
from .grammar import get_grammar_from_payload
from ..schemas.models import NormalFormRequest, NormalFormResponse

router = APIRouter(prefix="/normal-forms", tags=["Normal Forms"])


@router.post("/cnf", response_model=NormalFormResponse)
def get_cnf(payload: NormalFormRequest):
    try:
        grammar = get_grammar_from_payload(payload.raw_text, payload.grammar)
        res = convert_to_cnf(grammar)
        data = res.to_dict()
        data["normal_form"] = "CNF"
        data["is_valid"] = data["is_valid_cnf"]
        data["converted_grammar"] = data["cnf_grammar"]
        return NormalFormResponse(**data)
    except GrammarParseError as e:
        empty_g = {"id": "", "name": "", "description": "", "non_terminals": [], "terminals": [], "start_symbol": "", "productions": [], "raw_text": ""}
        return NormalFormResponse(
            success=False,
            normal_form="CNF",
            original_grammar=empty_g,
            converted_grammar=empty_g,
            is_valid=False,
            validation_errors=[str(e)],
            message=f"Parse error: {str(e)}",
        )
    except Exception as e:
        empty_g = {"id": "", "name": "", "description": "", "non_terminals": [], "terminals": [], "start_symbol": "", "productions": [], "raw_text": ""}
        return NormalFormResponse(
            success=False,
            normal_form="CNF",
            original_grammar=empty_g,
            converted_grammar=empty_g,
            is_valid=False,
            validation_errors=[str(e)],
            message=f"CNF conversion error: {str(e)}",
        )


@router.post("/gnf", response_model=NormalFormResponse)
def get_gnf(payload: NormalFormRequest):
    try:
        grammar = get_grammar_from_payload(payload.raw_text, payload.grammar)
        res = convert_to_gnf(grammar)
        data = res.to_dict()
        data["normal_form"] = "GNF"
        data["is_valid"] = data["is_valid_gnf"]
        data["converted_grammar"] = data["gnf_grammar"]
        return NormalFormResponse(**data)
    except GrammarParseError as e:
        empty_g = {"id": "", "name": "", "description": "", "non_terminals": [], "terminals": [], "start_symbol": "", "productions": [], "raw_text": ""}
        return NormalFormResponse(
            success=False,
            normal_form="GNF",
            original_grammar=empty_g,
            converted_grammar=empty_g,
            is_valid=False,
            validation_errors=[str(e)],
            message=f"Parse error: {str(e)}",
        )
    except Exception as e:
        empty_g = {"id": "", "name": "", "description": "", "non_terminals": [], "terminals": [], "start_symbol": "", "productions": [], "raw_text": ""}
        return NormalFormResponse(
            success=False,
            normal_form="GNF",
            original_grammar=empty_g,
            converted_grammar=empty_g,
            is_valid=False,
            validation_errors=[str(e)],
            message=f"GNF conversion error: {str(e)}",
        )
