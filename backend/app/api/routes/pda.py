"""Pushdown Automaton (PDA) management and simulation endpoints."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from ...core.pda_model import PDA, PDATransition, validate_pda
from ...core.pda_simulator import simulate_pda
from ...core.sample_data import SAMPLE_PDAS, get_sample_pda_anbn
from ..schemas.models import (
    PDASchema,
    PDASimulateRequest,
    PDASimulateResponse,
)

router = APIRouter(prefix="/pda", tags=["PDA Simulator"])


def get_pda_from_payload(payload_pda: PDASchema = None, sample_id: str = None) -> PDA:
    if sample_id:
        for s in SAMPLE_PDAS:
            if s["id"] == sample_id:
                return s["pda"].copy()
        if sample_id == "pda-anbn":
            return get_sample_pda_anbn()
    if payload_pda is not None:
        return PDA.from_dict(payload_pda.model_dump())
    return get_sample_pda_anbn()


@router.post("/validate")
def validate_pda_endpoint(payload: PDASchema):
    pda = PDA.from_dict(payload.model_dump())
    is_valid, errors, warnings = validate_pda(pda)
    return {
        "success": True,
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "pda": pda.to_dict(),
    }


@router.post("/simulate", response_model=PDASimulateResponse)
def simulate_pda_endpoint(payload: PDASimulateRequest):
    try:
        pda = get_pda_from_payload(payload.pda, payload.sample_id)
        res = simulate_pda(
            pda=pda,
            input_string=payload.input_string,
            max_steps=payload.max_steps,
            max_configurations=payload.max_configurations,
        )
        data = res.to_dict()
        data["success"] = res.status != "INVALID_PDA"
        return PDASimulateResponse(**data)
    except Exception as e:
        return PDASimulateResponse(
            success=False,
            accepted=False,
            status="ERROR",
            input_string=payload.input_string,
            acceptance_mode="FINAL_STATE",
            message=f"PDA simulation error: {str(e)}",
        )


@router.get("/samples")
def list_sample_pdas():
    samples_out = []
    for s in SAMPLE_PDAS:
        samples_out.append({
            "id": s["id"],
            "name": s["name"],
            "pda": s["pda"].to_dict(),
            "test_strings": s["test_strings"],
        })
    return {"samples": samples_out}
