from __future__ import annotations

import re
from typing import Any, Dict, List


def extract_citations(tool_calls: List[Dict[str, Any]], settings_server_url: str) -> List[Dict[str, Any]]:
    """
    Build a citation list from recorded tool calls so the UI can link back to
    the specific Tableau content that informed the agent's response.
    """
    citations: List[Dict[str, Any]] = []
    seen: set = set()

    for call in tool_calls:
        tool_name = call.get("tool_name", "")
        args = call.get("args", {})

        citation: Dict[str, Any] = {"tool": tool_name, "args": args}

        # Build a human-readable source reference
        if tool_name == "list_workbooks":
            citation["label"] = "Tableau Workbook Listing"
        elif tool_name == "get_view_data" and "view_id" in args:
            citation["label"] = f"View data: {args['view_id']}"
            citation["url"] = f"{settings_server_url}/#/views/{args['view_id']}"
        elif tool_name == "query_datasource" and "datasource_id" in args:
            citation["label"] = f"Datasource query: {args['datasource_id']}"
        elif tool_name == "get_pulse_insights" and "metric_id" in args:
            citation["label"] = f"Pulse metric: {args['metric_id']}"
        elif tool_name == "export_view" and "view_id" in args:
            citation["label"] = f"Exported view: {args['view_id']}"
        elif tool_name == "run_metadata_query":
            citation["label"] = "Metadata API query"
        elif tool_name == "query_hyper_file":
            citation["label"] = f"Hyper query: {args.get('hyper_path', '')}"
        elif tool_name == "summarize_dashboard":
            citation["label"] = f"Dashboard summary: {args.get('workbook_id', '')}"
        else:
            citation["label"] = tool_name

        key = f"{tool_name}:{str(args)}"
        if key not in seen:
            seen.add(key)
            citations.append(citation)

    return citations
