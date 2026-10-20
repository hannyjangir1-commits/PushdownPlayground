"""Health check endpoint."""

from fastapi import APIRouter
from ..schemas.models import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        app_name="Interactive CFG and PDA Learning Tool",
    )
