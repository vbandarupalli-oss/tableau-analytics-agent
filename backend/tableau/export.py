from __future__ import annotations

from typing import Literal

import httpx

from auth import get_session
from config import get_settings

ExportFormat = Literal["png", "pdf", "csv", "xlsx"]


class ExportService:
    """Download views as images, PDFs, or data files."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._session = get_session()

    def _url(self, path: str) -> str:
        base = self._settings.tableau_base_url
        site = self._session.site_luid or ""
        return f"{base}/sites/{site}{path}"

    async def _auth_header(self) -> str:
        await self._session.ensure_valid()
        return self._session.token or ""

    async def export_view_image(self, view_id: str, resolution: str = "high") -> bytes:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(
                self._url(f"/views/{view_id}/image"),
                headers={"X-Tableau-Auth": await self._auth_header(), "Accept": "image/png"},
                params={"resolution": resolution},
            )
            resp.raise_for_status()
            return resp.content

    async def export_view_pdf(self, view_id: str, page_type: str = "A4", orientation: str = "Landscape") -> bytes:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(
                self._url(f"/views/{view_id}/pdf"),
                headers={"X-Tableau-Auth": await self._auth_header(), "Accept": "application/pdf"},
                params={"type": page_type, "orientation": orientation},
            )
            resp.raise_for_status()
            return resp.content

    async def export_view_csv(self, view_id: str) -> bytes:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(
                self._url(f"/views/{view_id}/data"),
                headers={"X-Tableau-Auth": await self._auth_header(), "Accept": "text/csv"},
            )
            resp.raise_for_status()
            return resp.content

    async def export_workbook_pdf(self, workbook_id: str) -> bytes:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.get(
                self._url(f"/workbooks/{workbook_id}/pdf"),
                headers={"X-Tableau-Auth": await self._auth_header(), "Accept": "application/pdf"},
            )
            resp.raise_for_status()
            return resp.content
