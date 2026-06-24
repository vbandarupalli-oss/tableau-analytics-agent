from __future__ import annotations

"""
Claude tool definitions for Tableau operations.
Each entry is an Anthropic-compatible tool schema dict.
"""

TABLEAU_TOOLS = [
    {
        "name": "list_workbooks",
        "description": "List all workbooks on the connected Tableau site. Returns names, IDs, owners, and projects.",
        "input_schema": {
            "type": "object",
            "properties": {
                "page_size": {"type": "integer", "default": 50, "description": "Number of results per page"},
                "page_number": {"type": "integer", "default": 1, "description": "Page number (1-based)"},
            },
        },
    },
    {
        "name": "get_view_data",
        "description": "Retrieve the underlying data rows for a Tableau view/sheet by its ID.",
        "input_schema": {
            "type": "object",
            "required": ["view_id"],
            "properties": {
                "view_id": {"type": "string", "description": "LUID of the Tableau view"},
                "max_rows": {"type": "integer", "default": 200, "description": "Maximum rows to return"},
            },
        },
    },
    {
        "name": "query_datasource",
        "description": (
            "Query a published Tableau datasource via VizQL Data Service. "
            "Specify which fields (measures/dimensions) to pull and optional filters."
        ),
        "input_schema": {
            "type": "object",
            "required": ["datasource_id", "fields"],
            "properties": {
                "datasource_id": {"type": "string", "description": "LUID of the published datasource"},
                "fields": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Field names to include (e.g. ['Sales', 'Region', 'Order Date'])",
                },
                "filters": {
                    "type": "array",
                    "items": {"type": "object"},
                    "description": "Optional VizQL filter objects",
                },
                "page": {"type": "integer", "default": 1},
                "page_size": {"type": "integer", "default": 200},
            },
        },
    },
    {
        "name": "get_pulse_insights",
        "description": (
            "Fetch Einstein AI / Tableau Pulse insight bundle for a metric. "
            "Returns trend, BAN (big-ass number), comparisons, and anomaly insights."
        ),
        "input_schema": {
            "type": "object",
            "required": ["metric_id"],
            "properties": {
                "metric_id": {"type": "string", "description": "Pulse metric LUID"},
                "insight_types": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["BAN", "TREND", "BREAKDOWN", "ANCHOR_DATE", "UNUSUAL_CHANGE"]},
                    "description": "Subset of insight types to request (default: all)",
                },
                "time_comparison": {
                    "type": "string",
                    "default": "PREVIOUS_PERIOD",
                    "enum": ["PREVIOUS_PERIOD", "YEAR_AGO", "NONE"],
                },
            },
        },
    },
    {
        "name": "export_view",
        "description": "Export a Tableau view as PNG image, PDF, or CSV data file.",
        "input_schema": {
            "type": "object",
            "required": ["view_id"],
            "properties": {
                "view_id": {"type": "string", "description": "LUID of the view to export"},
                "format": {
                    "type": "string",
                    "enum": ["png", "pdf", "csv"],
                    "default": "png",
                    "description": "Output format",
                },
            },
        },
    },
    {
        "name": "run_metadata_query",
        "description": (
            "Run a GraphQL query against the Tableau Metadata API. "
            "Use this to explore content lineage, field schemas, and data source connections."
        ),
        "input_schema": {
            "type": "object",
            "required": ["gql"],
            "properties": {
                "gql": {"type": "string", "description": "GraphQL query string"},
                "variables": {"type": "object", "description": "Optional GraphQL variables"},
            },
        },
    },
    {
        "name": "query_hyper_file",
        "description": (
            "Run a SQL query against a local Tableau .hyper extract file. "
            "Returns columns and rows. Only available when tableauhyperapi is installed."
        ),
        "input_schema": {
            "type": "object",
            "required": ["hyper_path", "sql"],
            "properties": {
                "hyper_path": {"type": "string", "description": "Absolute path to the .hyper file"},
                "sql": {"type": "string", "description": "SQL SELECT statement to run"},
            },
        },
    },
    {
        "name": "summarize_dashboard",
        "description": (
            "Summarize a Tableau dashboard by listing all its views, "
            "fetching a sample of data from each, and providing a structured overview."
        ),
        "input_schema": {
            "type": "object",
            "required": ["workbook_id"],
            "properties": {
                "workbook_id": {"type": "string", "description": "LUID of the workbook to summarize"},
                "max_rows_per_view": {"type": "integer", "default": 50},
            },
        },
    },
]
