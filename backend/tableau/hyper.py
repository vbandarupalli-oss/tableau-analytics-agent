from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

# Graceful fallback — tableauhyperapi is optional
try:
    from tableauhyperapi import (
        Connection,
        CreateMode,
        HyperProcess,
        Name,
        SqlType,
        TableDefinition,
        TableName,
        Telemetry,
    )
    _HYPER_AVAILABLE = True
except ImportError:  # noqa: BLE001
    _HYPER_AVAILABLE = False


def hyper_available() -> bool:
    return _HYPER_AVAILABLE


async def query_hyper_file(hyper_path: str, sql: str) -> Dict[str, Any]:
    """
    Run a SQL query against a local .hyper file.
    Runs synchronously in a thread to avoid blocking the event loop.
    Returns {"columns": [...], "rows": [...], "row_count": int}.
    """
    if not _HYPER_AVAILABLE:
        return {
            "error": "tableauhyperapi is not installed. Add it to requirements.txt and reinstall.",
            "hyper_available": False,
        }

    path = Path(hyper_path)
    if not path.exists():
        return {"error": f"Hyper file not found: {hyper_path}", "hyper_available": True}

    def _run_sync() -> Dict[str, Any]:
        with HyperProcess(telemetry=Telemetry.DO_NOT_SEND_USAGE_DATA_TO_TABLEAU) as hyper:
            with Connection(hyper.endpoint, path, CreateMode.NONE) as conn:
                with conn.execute_query(sql) as result:
                    columns = [col.name.unescaped for col in result.schema.columns]
                    rows = [list(row) for row in result]
        return {"columns": columns, "rows": rows, "row_count": len(rows), "hyper_available": True}

    return await asyncio.to_thread(_run_sync)


async def list_hyper_tables(hyper_path: str) -> Dict[str, Any]:
    """List all tables inside a .hyper file."""
    if not _HYPER_AVAILABLE:
        return {"error": "tableauhyperapi is not installed.", "hyper_available": False}

    path = Path(hyper_path)
    if not path.exists():
        return {"error": f"Hyper file not found: {hyper_path}", "hyper_available": True}

    def _run_sync() -> Dict[str, Any]:
        with HyperProcess(telemetry=Telemetry.DO_NOT_SEND_USAGE_DATA_TO_TABLEAU) as hyper:
            with Connection(hyper.endpoint, path, CreateMode.NONE) as conn:
                tables = []
                for schema in conn.catalog.get_schema_names():
                    for table in conn.catalog.get_table_names(schema=schema):
                        tables.append({"schema": str(schema), "table": str(table.name)})
        return {"tables": tables, "hyper_available": True}

    return await asyncio.to_thread(_run_sync)
