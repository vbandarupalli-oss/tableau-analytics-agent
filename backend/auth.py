from __future__ import annotations

import asyncio
import time
from typing import Optional

import httpx

from config import Settings, get_settings


class TableauSession:
    """Holds a Tableau auth token and refreshes it when it expires."""

    TOKEN_LIFETIME_SECONDS = 7200  # Tableau tokens last ~2 h; refresh at 90 %

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._token: Optional[str] = None
        self._site_id: Optional[str] = None   # resolved site LUID (not content URL)
        self._acquired_at: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def token(self) -> Optional[str]:
        return self._token

    @property
    def site_luid(self) -> Optional[str]:
        return self._site_id

    def _is_expired(self) -> bool:
        age = time.monotonic() - self._acquired_at
        return age > self.TOKEN_LIFETIME_SECONDS * 0.9

    async def ensure_valid(self) -> None:
        if self._token and not self._is_expired():
            return
        async with self._lock:
            if self._token and not self._is_expired():
                return
            await self._sign_in()

    async def _sign_in(self) -> None:
        s = self._settings
        payload = {
            "credentials": {
                "personalAccessTokenName": s.tableau_pat_name,
                "personalAccessTokenSecret": s.tableau_pat_secret,
                "site": {"contentUrl": s.tableau_site_id},
            }
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{s.tableau_base_url}/auth/signin",
                json=payload,
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()

        creds = data["credentials"]
        self._token = creds["token"]
        self._site_id = creds["site"]["id"]
        self._acquired_at = time.monotonic()

    async def sign_out(self) -> None:
        if not self._token:
            return
        s = self._settings
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{s.tableau_base_url}/auth/signout",
                headers={"X-Tableau-Auth": self._token, "Accept": "application/json"},
            )
        self._token = None
        self._site_id = None
        self._acquired_at = 0.0


# Module-level singleton — shared across all requests
_session: Optional[TableauSession] = None


def get_session() -> TableauSession:
    global _session
    if _session is None:
        _session = TableauSession(get_settings())
    return _session
