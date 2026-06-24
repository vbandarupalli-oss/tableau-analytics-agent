from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from auth import get_session
from config import get_settings


class PulseAPI:
    """
    Tableau Pulse (Einstein AI) insight engine.
    Docs: https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_ref_pulse.htm
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._session = get_session()

    def _url(self, path: str) -> str:
        base = self._settings.tableau_base_url
        site = self._session.site_luid or ""
        return f"{base}/sites/{site}{path}"

    async def _headers(self) -> Dict[str, str]:
        await self._session.ensure_valid()
        return {
            "X-Tableau-Auth": self._session.token or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # -------------------------------------------------------- metric definitions
    async def list_metrics(self, page_size: int = 100) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                self._url("/pulse/metrics"),
                headers=await self._headers(),
                params={"pageSize": page_size},
            )
            resp.raise_for_status()
            return resp.json()

    async def get_metric(self, metric_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                self._url(f"/pulse/metrics/{metric_id}"),
                headers=await self._headers(),
            )
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------- subscriptions
    async def list_subscriptions(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                self._url("/pulse/subscriptions"),
                headers=await self._headers(),
            )
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------------ insights
    async def get_insight_bundle(
        self,
        metric_id: str,
        insight_types: Optional[List[str]] = None,
        time_comparison: str = "PREVIOUS_PERIOD",
    ) -> Dict[str, Any]:
        """
        Request an insight bundle for a metric.
        insight_types example: ["BAN", "TREND", "BREAKDOWN", "ANCHOR_DATE"]
        """
        payload: Dict[str, Any] = {
            "bundle_request": {
                "version": "1",
                "options": {
                    "output_format": "OUTPUT_FORMAT_TEXT",
                    "now": None,  # server fills current time
                },
                "input": {
                    "metadata": {"metric_id": metric_id},
                    "metric": {
                        "definition_id": metric_id,
                    },
                },
            }
        }
        if insight_types:
            payload["bundle_request"]["input"]["bundle_insight_types"] = insight_types
        if time_comparison:
            payload["bundle_request"]["input"]["time_comparison"] = time_comparison

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                self._url("/pulse/insights/bundle"),
                headers=await self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def get_metric_value(self, metric_id: str) -> Dict[str, Any]:
        """Current value (BAN) for a Pulse metric."""
        return await self.get_insight_bundle(metric_id, insight_types=["BAN"])
