from __future__ import annotations

import json
from typing import Any, AsyncIterator, Dict, List, Optional

import anthropic

from agent.base import BaseLLM, LLMMessage
from config import get_settings


class ClaudeLLM(BaseLLM):
    """Anthropic Claude implementation with prompt caching enabled."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._model = settings.anthropic_model
        self._settings = settings

    @property
    def provider_name(self) -> str:
        return "claude"

    def _build_messages(self, messages: List[LLMMessage]) -> List[Dict[str, Any]]:
        return [m.to_dict() for m in messages]

    async def chat(
        self,
        messages: List[LLMMessage],
        system: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
    ) -> Dict[str, Any]:
        kwargs: Dict[str, Any] = {
            "model": self._model,
            "max_tokens": max_tokens,
            "messages": self._build_messages(messages),
        }
        if system:
            # Attach cache_control to system prompt for prompt caching
            kwargs["system"] = [
                {
                    "type": "text",
                    "text": system,
                    "cache_control": {"type": "ephemeral"},
                }
            ]
        if tools:
            kwargs["tools"] = tools
        # temperature=0 is valid for extended thinking but skip parameter for cleanliness
        if temperature != 0.0:
            kwargs["temperature"] = temperature

        response = await self._client.messages.create(**kwargs)
        return {
            "id": response.id,
            "content": response.content,
            "stop_reason": response.stop_reason,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
                "cache_read_input_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
                "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
            },
        }

    async def stream(
        self,
        messages: List[LLMMessage],
        system: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
    ) -> AsyncIterator[str]:
        kwargs: Dict[str, Any] = {
            "model": self._model,
            "max_tokens": max_tokens,
            "messages": self._build_messages(messages),
        }
        if system:
            kwargs["system"] = [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}]
        if tools:
            kwargs["tools"] = tools
        if temperature != 0.0:
            kwargs["temperature"] = temperature

        async with self._client.messages.stream(**kwargs) as stream_ctx:
            async for text in stream_ctx.text_stream:
                yield text
