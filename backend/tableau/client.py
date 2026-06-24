from __future__ import annotations

from typing import Any, Dict, Optional

import httpx

from auth import TableauSession, get_session
from config import Settings, get_settings


class TableauClient:
    """Thin async HTTP client pre-loaded with Tableau auth headers."""

    def __init__(self, settings: Settings | None = None, session: TableauSession | None = None) -> None:
        self._settings = settings or get_settings()
        self._session = session or get_session()

    async def _headers(self) -> Dict[str, str]:
        await self._session.ensure_valid()
        return {
            "X-Tableau-Auth": self._session.token or "",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def _url(self, path: str) -> str:
        base = self._settings.tableau_base_url
        site = self._session.site_luid or ""
        # paths like /sites/{site_id}/... are built by callers; this just anchors the base
        return f"{base}{path}"

    async def get(self, path: str, **kwargs: Any) -> httpx.Response:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(self._url(path), headers=await self._headers(), **kwargs)
            resp.raise_for_status()
            return resp

    async def post(self, path: str, **kwargs: Any) -> httpx.Response:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(self._url(path), headers=await self._headers(), **kwargs)
            resp.raise_for_status()
            return resp

    async def delete(self, path: str, **kwargs: Any) -> httpx.Response:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.delete(self._url(path), headers=await self._headers(), **kwargs)
            resp.raise_for_status()
            return resp

    @property
    def site_id(self) -> str:
        return self._session.site_luid or ""
