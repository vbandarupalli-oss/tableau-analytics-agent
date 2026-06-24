from __future__ import annotations

from typing import Any, Dict, Optional

import httpx

from auth import get_session
from config import get_settings

_DEFAULT_QUERY = """
{
  workbooksConnection(first: 20) {
    nodes {
      id luid name description
      projectName
      owner { name }
      views { id luid name }
    }
  }
}
"""


class MetadataAPI:
    """
    Tableau Metadata API — GraphQL endpoint for content lineage, schemas, and search.
    Docs: https://help.tableau.com/current/api/metadata_api/en-us/
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._session = get_session()

    def _url(self) -> str:
        base = self._settings.tableau_server_url.rstrip("/")
        return f"{base}/api/metadata/graphql"

    async def _headers(self) -> Dict[str, str]:
        await self._session.ensure_valid()
        return {
            "X-Tableau-Auth": self._session.token or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def query(
        self,
        gql: str = _DEFAULT_QUERY,
        variables: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run an arbitrary GraphQL query against the Metadata API."""
        payload: Dict[str, Any] = {"query": gql}
        if variables:
            payload["variables"] = variables
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                self._url(),
                json=payload,
                headers=await self._headers(),
            )
            resp.raise_for_status()
            return resp.json()

    async def search_content(self, term: str, content_type: str = "workbooks") -> Dict[str, Any]:
        """Keyword search via Metadata GraphQL."""
        gql = f"""
        {{
          {content_type}Connection(filter: {{nameWithin: ["{term}"]}}, first: 20) {{
            nodes {{
              id luid name
            }}
          }}
        }}
        """
        return await self.query(gql)

    async def get_datasource_fields(self, datasource_luid: str) -> Dict[str, Any]:
        gql = """
        query DatasourceFields($luid: String!) {
          publishedDatasourcesConnection(filter: {luidWithin: [$luid]}) {
            nodes {
              name
              fields {
                id name dataType
                description
              }
            }
          }
        }
        """
        return await self.query(gql, variables={"luid": datasource_luid})

    async def get_workbook_lineage(self, workbook_luid: str) -> Dict[str, Any]:
        gql = """
        query WorkbookLineage($luid: String!) {
          workbooksConnection(filter: {luidWithin: [$luid]}) {
            nodes {
              name luid
              upstreamDatasources { name luid }
              upstreamDatabases { name connectionType }
              upstreamTables { name schema database { name } }
            }
          }
        }
        """
        return await self.query(gql, variables={"luid": workbook_luid})
