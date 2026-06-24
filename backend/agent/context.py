from __future__ import annotations

from typing import Any, Dict, List, Optional

from agent.base import LLMMessage

SYSTEM_PROMPT = """\
You are the Tableau Analytics Agent — an expert AI assistant for Tableau Server and Tableau Cloud.

You have access to a suite of Tableau tools:
- list_workbooks: browse content on the site
- get_view_data: retrieve the data behind a view
- query_datasource: query a published datasource via VizQL Data Service
- get_pulse_insights: fetch Einstein AI / Tableau Pulse insights for a metric
- export_view: export a view as PNG, PDF, or CSV
- run_metadata_query: explore lineage and schema via the Metadata GraphQL API
- query_hyper_file: query a local .hyper extract file with SQL
- summarize_dashboard: produce a structured summary of a full workbook

Guidelines:
- Always call the most appropriate tool before answering data questions.
- Summarise data clearly — use Markdown tables when presenting structured results.
- If the user's question is ambiguous, ask a clarifying question rather than guessing.
- Cite the Tableau content you used (workbook, view, datasource) after each answer.
- Never invent data; always retrieve it via a tool call.
"""


def build_messages(
    user_message: str,
    history: List[LLMMessage],
    extra_context: Optional[Dict[str, Any]] = None,
) -> tuple[List[LLMMessage], str]:
    """Return (messages_list, system_prompt) ready to pass to the LLM."""
    system = SYSTEM_PROMPT
    if extra_context:
        ctx_lines = "\n".join(f"- {k}: {v}" for k, v in extra_context.items())
        system += f"\n\n## Additional context\n{ctx_lines}"

    messages = list(history)
    messages.append(LLMMessage(role="user", content=user_message))
    return messages, system
