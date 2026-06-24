from __future__ import annotations

from typing import Any, Dict, List, Optional

from tableau.client import TableauClient


class TableauRestAPI:
    """Wrapper around the most-used Tableau REST API endpoints."""

    def __init__(self, client: TableauClient | None = None) -> None:
        self._c = client or TableauClient()

    # ------------------------------------------------------------------ sites
    async def get_current_site(self) -> Dict[str, Any]:
        resp = await self._c.get(f"/sites/{self._c.site_id}")
        return resp.json()["site"]

    # --------------------------------------------------------------- workbooks
    async def list_workbooks(self, page_size: int = 100, page_number: int = 1) -> Dict[str, Any]:
        resp = await self._c.get(
            f"/sites/{self._c.site_id}/workbooks",
            params={"pageSize": page_size, "pageNumber": page_number},
        )
        return resp.json()

    async def get_workbook(self, workbook_id: str) -> Dict[str, Any]:
        resp = await self._c.get(f"/sites/{self._c.site_id}/workbooks/{workbook_id}")
        return resp.json()["workbook"]

    async def get_workbook_views(self, workbook_id: str) -> List[Dict[str, Any]]:
        resp = await self._c.get(f"/sites/{self._c.site_id}/workbooks/{workbook_id}/views")
        return resp.json().get("views", {}).get("view", [])

    # ------------------------------------------------------------------ views
    async def list_views(self, page_size: int = 100, page_number: int = 1) -> Dict[str, Any]:
        resp = await self._c.get(
            f"/sites/{self._c.site_id}/views",
            params={"pageSize": page_size, "pageNumber": page_number},
        )
        return resp.json()

    async def get_view(self, view_id: str) -> Dict[str, Any]:
        resp = await self._c.get(f"/sites/{self._c.site_id}/views/{view_id}")
        return resp.json()["view"]

    async def get_view_data(self, view_id: str, max_rows: int = 200) -> Dict[str, Any]:
        resp = await self._c.get(
            f"/sites/{self._c.site_id}/views/{view_id}/data",
            params={"maxRows": max_rows},
        )
        return resp.json()

    # ------------------------------------------------------------ datasources
    async def list_datasources(self, page_size: int = 100, page_number: int = 1) -> Dict[str, Any]:
        resp = await self._c.get(
            f"/sites/{self._c.site_id}/datasources",
            params={"pageSize": page_size, "pageNumber": page_number},
        )
        return resp.json()

    async def get_datasource(self, datasource_id: str) -> Dict[str, Any]:
        resp = await self._c.get(f"/sites/{self._c.site_id}/datasources/{datasource_id}")
        return resp.json()["datasource"]

    # ------------------------------------------------------------------ users
    async def list_users(self, page_size: int = 100) -> Dict[str, Any]:
        resp = await self._c.get(
            f"/sites/{self._c.site_id}/users",
            params={"pageSize": page_size},
        )
        return resp.json()

    # ---------------------------------------------------------------- projects
    async def list_projects(self) -> Dict[str, Any]:
        resp = await self._c.get(f"/sites/{self._c.site_id}/projects")
        return resp.json()

    # ------------------------------------------------------- view image / pdf
    async def get_view_image(self, view_id: str, resolution: str = "high") -> bytes:
        import httpx as _httpx
        from auth import get_session
        from config import get_settings

        await get_session().ensure_valid()
        url = f"{get_settings().tableau_base_url}/sites/{self._c.site_id}/views/{view_id}/image"
        headers = {
            "X-Tableau-Auth": get_session().token or "",
            "Accept": "image/png",
        }
        async with _httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(url, headers=headers, params={"resolution": resolution})
            resp.raise_for_status()
            return resp.content
