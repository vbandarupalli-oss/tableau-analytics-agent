from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from auth import get_session
from config import get_settings


class VizQLDataService:
    """
    VizQL Data Service — headless data queries against a published datasource.
    Docs: https://help.tableau.com/current/api/vizql-data-service/en-us/
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._session = get_session()

    def _vds_url(self, path: str) -> str:
        base = self._settings.tableau_server_url.rstrip("/")
        return f"{base}/api/v1/vizql-data-service{path}"

    async def _headers(self) -> Dict[str, str]:
        await self._session.ensure_valid()
        return {
            "X-Tableau-Auth": self._session.token or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def query_datasource(
        self,
        datasource_luid: str,
        fields: List[str],
        filters: Optional[List[Dict[str, Any]]] = None,
        sorts: Optional[List[Dict[str, Any]]] = None,
        page: int = 1,
        page_size: int = 200,
    ) -> Dict[str, Any]:
        """Query a published datasource via VizQL Data Service."""
        payload: Dict[str, Any] = {
            "datasource": {"datasourceLuid": datasource_luid},
            "fields": [{"fieldName": f} for f in fields],
            "options": {
                "returnFormat": "OBJECTS",
                "paginationOptions": {"firstRow": (page - 1) * page_size, "maxRows": page_size},
            },
        }
        if filters:
            payload["filters"] = filters
        if sorts:
            payload["sorts"] = sorts

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                self._vds_url("/query-datasource"),
                json=payload,
                headers=await self._headers(),
            )
            resp.raise_for_status()
            return resp.json()

    async def get_datasource_metadata(self, datasource_luid: str) -> Dict[str, Any]:
        """Retrieve field metadata for a datasource."""
        payload = {"datasource": {"datasourceLuid": datasource_luid}}
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                self._vds_url("/read-metadata"),
                json=payload,
                headers=await self._headers(),
            )
            resp.raise_for_status()
            return resp.json()
