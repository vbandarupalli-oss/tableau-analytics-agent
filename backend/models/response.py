from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    conversation_id: Optional[str] = None
    history: List[AgentMessage] = Field(default_factory=list)
    context: Optional[Dict[str, Any]] = None  # extra kv context injected into system prompt


class AgentChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_calls_made: List[str] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    thinking: Optional[str] = None


class StreamChunk(BaseModel):
    type: str  # "text" | "tool_use" | "done" | "error"
    content: Optional[str] = None
    tool_name: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    llm_provider: str
    tableau_server: str
