from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from tableau.export import ExportService

router = APIRouter(prefix="/export", tags=["export"])


def _svc() -> ExportService:
    return ExportService()


@router.get("/views/{view_id}/image")
async def export_view_image(
    view_id: str,
    resolution: str = Query("high", pattern="^(high|medium|low)$"),
) -> Response:
    try:
        data = await _svc().export_view_image(view_id, resolution=resolution)
        return Response(content=data, media_type="image/png")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/views/{view_id}/pdf")
async def export_view_pdf(
    view_id: str,
    page_type: str = Query("A4"),
    orientation: str = Query("Landscape", pattern="^(Portrait|Landscape)$"),
) -> Response:
    try:
        data = await _svc().export_view_pdf(view_id, page_type=page_type, orientation=orientation)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="view-{view_id}.pdf"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/views/{view_id}/csv")
async def export_view_csv(view_id: str) -> Response:
    try:
        data = await _svc().export_view_csv(view_id)
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="view-{view_id}.csv"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/workbooks/{workbook_id}/pdf")
async def export_workbook_pdf(workbook_id: str) -> Response:
    try:
        data = await _svc().export_workbook_pdf(workbook_id)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="workbook-{workbook_id}.pdf"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
