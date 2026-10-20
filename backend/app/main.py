"""FastAPI Application entrypoint for Interactive CFG & PDA Learning Tool."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.routes import (
    health,
    grammar,
    derivation,
    normal_forms,
    cyk,
    pda,
    visualization,
    batch_testing,
)

app = FastAPI(
    title="Interactive CFG and PDA Learning Tool API",
    description="Backend API powering formal language algorithms, CNF/GNF conversions, CYK parser, PDA simulator, and visualizations.",
    version="1.0.0",
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Local development environment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "InternalServerError",
            "message": str(exc),
        },
    )

# Include API Routers
app.include_router(health.router, prefix="/api")
app.include_router(grammar.router, prefix="/api")
app.include_router(derivation.router, prefix="/api")
app.include_router(normal_forms.router, prefix="/api")
app.include_router(cyk.router, prefix="/api")
app.include_router(pda.router, prefix="/api")
app.include_router(visualization.router, prefix="/api")
app.include_router(batch_testing.router, prefix="/api")


import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist) and os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            return JSONResponse(status_code=404, content={"error": "API route not found"})
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Welcome to Interactive CFG and PDA Learning Tool API."}
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to Interactive CFG and PDA Learning Tool API. Visit /docs for OpenAPI documentation.",
            "health": "/api/health",
        }
