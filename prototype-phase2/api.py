"""Optional FastAPI interface for the SupplementQuest decision service."""

from functools import lru_cache
from pathlib import Path
from typing import Literal
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
import os

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from decision_card import DecisionCard
from decision_service import SupplementQuestService

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "ods"
DATABASE_DIR = Path(os.environ.get("SUPPLEMENTQUEST_DATABASE_DIR", str(BASE_DIR / ".chroma")))
FRONTEND_DIR = BASE_DIR.parent / "dist"


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    """Initialize the index on startup and release handles on shutdown."""
    service = get_service()
    try:
        yield
    finally:
        service.rag_engine.close()
        get_service.cache_clear()


app = FastAPI(
    title="SupplementQuest",
    description="Local NIH ODS retrieval and safety-first Decision Cards.",
    version="0.1.0",
    lifespan=lifespan,
)


class DecisionRequest(BaseModel):
    """Request body for an evidence review."""

    query: str = Field(min_length=1, max_length=1000)
    language: Literal["English", "Español"] = "English"


@lru_cache(maxsize=1)
def get_service() -> SupplementQuestService:
    """Create one persistent local service instance for the API process."""
    return SupplementQuestService(DATA_DIR, DATABASE_DIR)


@app.get("/health")
@app.get("/api/health")
def health() -> dict[str, int | str]:
    """Report server readiness and the number of indexed source passages."""
    count = get_service().rag_engine.collection.count()
    return {"status": "ok", "indexed_passages": count}


@app.post("/decision", response_model=DecisionCard)
@app.post("/api/decision", response_model=DecisionCard)
def create_decision(request: DecisionRequest) -> DecisionCard:
    """Return a safety-screened, locally retrieved Decision Card."""
    if not request.query.strip():
        raise HTTPException(status_code=422, detail="Query must not be empty.")
    return get_service().review(request.query, request.language)


if (FRONTEND_DIR / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")


@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str) -> FileResponse:
    """Serve the built mobile app and its client-side routes on the API origin."""
    if path == "api" or path.startswith(("api/", "assets/")):
        raise HTTPException(status_code=404, detail="Not found.")
    public_files = {"manifest.webmanifest", "app-icon.svg", "favicon.svg"}
    file_path = FRONTEND_DIR / (path if path in public_files else "index.html")
    if not file_path.is_file():
        raise HTTPException(
            status_code=503,
            detail="Mobile frontend is not built. Run npm run build from the repository root.",
        )
    return FileResponse(file_path, headers={"Cache-Control": "no-store"})
