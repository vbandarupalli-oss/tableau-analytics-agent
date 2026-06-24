from __future__ import annotations

from typing import Any, AsyncIterator, Dict, List, Optional

from agent.base import BaseLLM, LLMMessage


class GeminiLLM(BaseLLM):
    """Google Gemini stub — not yet implemented."""

    @property
    def provider_name(self) -> str:
        return "gemini"

    async def chat(self, messages: List[LLMMessage], **kwargs: Any) -> Dict[str, Any]:
        raise NotImplementedError("Gemini provider is not yet implemented. Set LLM_PROVIDER=claude.")

    async def stream(self, messages: List[LLMMessage], **kwargs: Any) -> AsyncIterator[str]:
        raise NotImplementedError("Gemini provider is not yet implemented. Set LLM_PROVIDER=claude.")
        yield ""  # type: ignore[misc]
