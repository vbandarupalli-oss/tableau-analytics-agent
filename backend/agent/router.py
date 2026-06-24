from __future__ import annotations

from functools import lru_cache

from agent.base import BaseLLM
from agent.claude import ClaudeLLM
from agent.gemini import GeminiLLM
from agent.openai_llm import OpenAILLM
from config import get_settings


@lru_cache
def get_llm() -> BaseLLM:
    provider = get_settings().llm_provider.lower()
    match provider:
        case "claude":
            return ClaudeLLM()
        case "openai":
            return OpenAILLM()
        case "gemini":
            return GeminiLLM()
        case _:
            raise ValueError(f"Unknown LLM_PROVIDER: {provider!r}. Must be claude|openai|gemini.")
