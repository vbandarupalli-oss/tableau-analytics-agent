from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query

from models.tableau import (
    HyperQueryRequest,
    MetadataQueryRequest,
    PulseInsightRequest,
    QueryDatasourceRequest,
)
from tableau.hyper import list_hyper_tables, query_hyper_file
from tableau.metadata import MetadataAPI
from tableau.pulse import PulseAPI
from tableau.rest_api import TableauRestAPI
from tableau.vizql import VizQLDataService

router = APIRouter(prefix="/tableau", tags=["tableau"])


def _rest() -> TableauRestAPI:
    return TableauRestAPI()


def _vizql() -> VizQLDataService:
    return VizQLDataService()


def _pulse() -> PulseAPI:
    return PulseAPI()


def _metadata() -> MetadataAPI:
    return MetadataAPI()


# ------------------------------------------------------------------ workbooks
@router.get("/workbooks")
async def list_workbooks(
    page_size: int = Query(50, ge=1, le=200),
    page_number: int = Query(1, ge=1),
) -> Dict[str, Any]:
    try:
        return await _rest().list_workbooks(page_size=page_size, page_number=page_number)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/workbooks/{workbook_id}")
async def get_workbook(workbook_id: str) -> Dict[str, Any]:
    try:
        return await _rest().get_workbook(workbook_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/workbooks/{workbook_id}/views")
async def get_workbook_views(workbook_id: str) -> Dict[str, Any]:
    try:
        views = await _rest().get_workbook_views(workbook_id)
        return {"views": views}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# -------------------------------------------------------------------- views
@router.get("/views")
async def list_views(
    page_size: int = Query(50, ge=1, le=200),
    page_number: int = Query(1, ge=1),
) -> Dict[str, Any]:
    try:
        return await _rest().list_views(page_size=page_size, page_number=page_number)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/views/{view_id}/data")
async def get_view_data(view_id: str, max_rows: int = Query(200, ge=1, le=2000)) -> Dict[str, Any]:
    try:
        return await _rest().get_view_data(view_id, max_rows=max_rows)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ------------------------------------------------------------ datasources
@router.get("/datasources")
async def list_datasources(
    page_size: int = Query(50, ge=1, le=200),
) -> Dict[str, Any]:
    try:
        return await _rest().list_datasources(page_size=page_size)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/datasources/query")
async def query_datasource(request: QueryDatasourceRequest) -> Dict[str, Any]:
    try:
        return await _vizql().query_datasource(
            datasource_luid=request.datasource_id,
            fields=request.fields,
            filters=request.filters,
            page=request.page,
            page_size=request.page_size,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ------------------------------------------------------------------- pulse
@router.get("/pulse/metrics")
async def list_pulse_metrics() -> Dict[str, Any]:
    try:
        return await _pulse().list_metrics()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/pulse/insights")
async def get_pulse_insights(request: PulseInsightRequest) -> Dict[str, Any]:
    try:
        return await _pulse().get_insight_bundle(
            metric_id=request.metric_id,
            insight_types=request.insight_types,
            time_comparison=request.time_comparison,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ---------------------------------------------------------------- metadata
@router.post("/metadata/query")
async def metadata_query(request: MetadataQueryRequest) -> Dict[str, Any]:
    try:
        return await _metadata().query(gql=request.gql, variables=request.variables)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/metadata/search")
async def metadata_search(term: str = Query(...), content_type: str = Query("workbooks")) -> Dict[str, Any]:
    try:
        return await _metadata().search_content(term=term, content_type=content_type)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ------------------------------------------------------------------ hyper
@router.get("/hyper/status")
async def hyper_status() -> Dict[str, Any]:
    from tableau.hyper import hyper_available
    return {"available": hyper_available()}


@router.post("/hyper/query")
async def hyper_query(request: HyperQueryRequest) -> Dict[str, Any]:
    return await query_hyper_file(request.hyper_path, request.sql)


@router.get("/hyper/tables")
async def hyper_tables(hyper_path: str = Query(...)) -> Dict[str, Any]:
    return await list_hyper_tables(hyper_path)
