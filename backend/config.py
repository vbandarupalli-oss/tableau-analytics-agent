from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Tableau
    tableau_server_url: str = Field(..., description="Base URL of Tableau Server/Cloud")
    tableau_site_id: str = Field("", description="Site content URL — empty for Default")
    tableau_pat_name: str = Field(..., description="Personal Access Token name")
    tableau_pat_secret: str = Field(..., description="Personal Access Token secret")

    # LLM
    llm_provider: str = Field("claude", pattern="^(claude|openai|gemini)$")
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"
    openai_api_key: str = ""
    google_api_key: str = ""

    # Agent
    agent_max_tokens: int = 4096
    agent_temperature: float = 0.0
    agent_max_tool_rounds: int = 10

    # Server
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    log_level: str = "INFO"
    host: str = "0.0.0.0"
    port: int = 8000

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @property
    def tableau_api_version(self) -> str:
        return "3.22"

    @property
    def tableau_base_url(self) -> str:
        return f"{self.tableau_server_url.rstrip('/')}/api/{self.tableau_api_version}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
