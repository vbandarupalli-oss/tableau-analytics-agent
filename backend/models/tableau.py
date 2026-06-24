from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class WorkbookSummary(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    project_name: Optional[str] = None
    owner_name: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    webpage_url: Optional[str] = None


class ViewSummary(BaseModel):
    id: str
    name: str
    content_url: Optional[str] = None
    owner_name: Optional[str] = None
    total_views: Optional[int] = None


class DatasourceSummary(BaseModel):
    id: str
    name: str
    type: Optional[str] = None
    project_name: Optional[str] = None
    owner_name: Optional[str] = None
    updated_at: Optional[str] = None


class QueryDatasourceRequest(BaseModel):
    datasource_id: str
    fields: List[str] = Field(..., min_length=1)
    filters: Optional[List[Dict[str, Any]]] = None
    sorts: Optional[List[Dict[str, Any]]] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(200, ge=1, le=1000)


class HyperQueryRequest(BaseModel):
    hyper_path: str
    sql: str = Field(..., min_length=1)


class ExportRequest(BaseModel):
    view_id: str
    format: str = Field("png", pattern="^(png|pdf|csv)$")
    resolution: str = "high"

    model_config = {"populate_by_name": True}


class PulseInsightRequest(BaseModel):
    metric_id: str
    insight_types: Optional[List[str]] = None
    time_comparison: str = "PREVIOUS_PERIOD"


class MetadataQueryRequest(BaseModel):
    gql: str = Field(..., min_length=1)
    variables: Optional[Dict[str, Any]] = None
