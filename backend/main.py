from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import agent, auth, export, tableau

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    logger.info("Starting Tableau Analytics Agent backend")
    logger.info("Tableau server: %s", settings.tableau_server_url)
    logger.info("LLM provider: %s  model: %s", settings.llm_provider, settings.anthropic_model)
    yield
    logger.info("Shutting down — signing out of Tableau")
    from auth import get_session
    await get_session().sign_out()


settings = get_settings()

app = FastAPI(
    title="Tableau Analytics Agent",
    description="AI-powered analytics agent for Tableau Server / Cloud",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agent.router)
app.include_router(tableau.router)
app.include_router(export.router)


@app.get("/health", tags=["meta"])
async def health() -> dict:
    from models.response import HealthResponse
    return HealthResponse(
        status="ok",
        version="1.0.0",
        llm_provider=settings.llm_provider,
        tableau_server=settings.tableau_server_url,
    ).model_dump()


@app.get("/", tags=["meta"])
async def root() -> dict:
    return {
        "name": "Tableau Analytics Agent",
        "docs": "/docs",
        "health": "/health",
        "agent_chat": "POST /agent/chat",
        "agent_stream": "POST /agent/chat/stream",
    }
