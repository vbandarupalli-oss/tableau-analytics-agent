from __future__ import annotations

import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from agent.base import LLMMessage
from agent.orchestrator import AgentOrchestrator
from models.response import AgentChatRequest, AgentChatResponse

router = APIRouter(prefix="/agent", tags=["agent"])

_orchestrator: AgentOrchestrator | None = None


def _get_orchestrator() -> AgentOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator


@router.post("/chat", response_model=AgentChatResponse)
async def chat(request: AgentChatRequest) -> AgentChatResponse:
    """Full request/response chat with the analytics agent."""
    history = [LLMMessage(role=m.role, content=m.content) for m in request.history]
    try:
        return await _get_orchestrator().chat(
            user_message=request.message,
            history=history,
            context=request.context,
            conversation_id=request.conversation_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/chat/stream")
async def chat_stream(request: AgentChatRequest) -> EventSourceResponse:
    """Server-Sent Events stream — yields text chunks as they arrive."""
    history = [LLMMessage(role=m.role, content=m.content) for m in request.history]

    async def generator() -> AsyncIterator[dict]:
        try:
            async for chunk in _get_orchestrator().stream(
                user_message=request.message,
                history=history,
                context=request.context,
            ):
                yield {"event": "text", "data": chunk}
            yield {"event": "done", "data": "[DONE]"}
        except Exception as exc:
            yield {"event": "error", "data": json.dumps({"error": str(exc)})}

    return EventSourceResponse(generator())


@router.get("/health")
async def agent_health() -> dict:
    from agent.router import get_llm
    from config import get_settings

    llm = get_llm()
    return {
        "status": "ok",
        "llm_provider": llm.provider_name,
        "model": get_settings().anthropic_model,
    }
