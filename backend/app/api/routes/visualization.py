"""Visualizations endpoint (Parse Tree & Automata Diagram)."""

from fastapi import APIRouter
from ...core.grammar_parser import GrammarParseError
from ...core.derivation_engine import find_derivation
from ...core.parse_tree import build_parse_tree_from_derivation, flatten_tree_to_graph
from ...core.automata_graph import generate_pda_graph
from .grammar import get_grammar_from_payload
from .pda import get_pda_from_payload
from ..schemas.models import (
    DerivationSearchRequest,
    ParseTreeResponse,
    PDASchema,
    AutomataGraphResponse,
)

router = APIRouter(prefix="/visualization", tags=["Visualizations"])


@router.post("/parse-tree", response_model=ParseTreeResponse)
def get_parse_tree(payload: DerivationSearchRequest):
    try:
        grammar = get_grammar_from_payload(payload.raw_text, payload.grammar)
        deriv = find_derivation(grammar, payload.target_string, mode=payload.mode)
        if not deriv.success:
            return ParseTreeResponse(
                success=False,
                message=deriv.message,
            )

        tree = build_parse_tree_from_derivation(grammar.start_symbol, deriv.steps, grammar.terminals)
        flat = flatten_tree_to_graph(tree)
        return ParseTreeResponse(
            success=True,
            root=tree.to_dict(),
            nodes=flat["nodes"],
            edges=flat["edges"],
            message=f"Parse tree constructed for '{payload.target_string}'.",
        )
    except GrammarParseError as e:
        return ParseTreeResponse(success=False, message=str(e))
    except Exception as e:
        return ParseTreeResponse(success=False, message=f"Tree error: {str(e)}")


@router.post("/pda", response_model=AutomataGraphResponse)
def get_pda_graph_endpoint(payload: PDASchema):
    try:
        pda = get_pda_from_payload(payload)
        graph = generate_pda_graph(pda)
        return AutomataGraphResponse(
            success=True,
            nodes=graph["nodes"],
            edges=graph["edges"],
            initial_state=graph["initial_state"],
            accepting_states=graph["accepting_states"],
            acceptance_mode=graph["acceptance_mode"],
        )
    except Exception as e:
        return AutomataGraphResponse(
            success=False,
            nodes=[],
            edges=[],
            acceptance_mode="FINAL_STATE",
        )
