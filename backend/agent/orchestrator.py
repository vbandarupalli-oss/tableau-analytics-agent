from __future__ import annotations

import json
import uuid
from typing import Any, AsyncIterator, Dict, List, Optional

from agent.base import LLMMessage
from agent.cache import tool_cache
from agent.citations import extract_citations
from agent.context import build_messages
from agent.router import get_llm
from agent.tools import TABLEAU_TOOLS
from config import get_settings
from models.response import AgentChatResponse
from tableau.export import ExportService
from tableau.hyper import query_hyper_file
from tableau.metadata import MetadataAPI
from tableau.pulse import PulseAPI
from tableau.rest_api import TableauRestAPI
from tableau.vizql import VizQLDataService


class ToolExecutor:
    """Dispatches tool_use blocks to the correct Tableau API method."""

    def __init__(self) -> None:
        self._rest = TableauRestAPI()
        self._vizql = VizQLDataService()
        self._pulse = PulseAPI()
        self._metadata = MetadataAPI()
        self._export = ExportService()

    async def execute(self, tool_name: str, tool_input: Dict[str, Any]) -> Any:
        cache_key = f"{tool_name}:{json.dumps(tool_input, sort_keys=True)}"
        cached = await tool_cache.get(cache_key)
        if cached is not None:
            return cached

        result = await self._dispatch(tool_name, tool_input)
        await tool_cache.set(cache_key, result)
        return result

    async def _dispatch(self, name: str, args: Dict[str, Any]) -> Any:
        match name:
            case "list_workbooks":
                return await self._rest.list_workbooks(
                    page_size=args.get("page_size", 50),
                    page_number=args.get("page_number", 1),
                )
            case "get_view_data":
                return await self._rest.get_view_data(
                    view_id=args["view_id"],
                    max_rows=args.get("max_rows", 200),
                )
            case "query_datasource":
                return await self._vizql.query_datasource(
                    datasource_luid=args["datasource_id"],
                    fields=args["fields"],
                    filters=args.get("filters"),
                    page=args.get("page", 1),
                    page_size=args.get("page_size", 200),
                )
            case "get_pulse_insights":
                return await self._pulse.get_insight_bundle(
                    metric_id=args["metric_id"],
                    insight_types=args.get("insight_types"),
                    time_comparison=args.get("time_comparison", "PREVIOUS_PERIOD"),
                )
            case "export_view":
                fmt = args.get("format", "png")
                view_id = args["view_id"]
                if fmt == "png":
                    data = await self._export.export_view_image(view_id)
                    return {"format": "png", "size_bytes": len(data), "note": "Binary PNG data — use /export endpoint to download"}
                elif fmt == "pdf":
                    data = await self._export.export_view_pdf(view_id)
                    return {"format": "pdf", "size_bytes": len(data), "note": "Binary PDF data — use /export endpoint to download"}
                else:
                    data = await self._export.export_view_csv(view_id)
                    return {"format": "csv", "content": data.decode("utf-8", errors="replace")}
            case "run_metadata_query":
                return await self._metadata.query(
                    gql=args["gql"],
                    variables=args.get("variables"),
                )
            case "query_hyper_file":
                return await query_hyper_file(
                    hyper_path=args["hyper_path"],
                    sql=args["sql"],
                )
            case "summarize_dashboard":
                return await self._summarize_dashboard(
                    workbook_id=args["workbook_id"],
                    max_rows=args.get("max_rows_per_view", 50),
                )
            case _:
                return {"error": f"Unknown tool: {name}"}

    async def _summarize_dashboard(self, workbook_id: str, max_rows: int) -> Dict[str, Any]:
        workbook = await self._rest.get_workbook(workbook_id)
        views = await self._rest.get_workbook_views(workbook_id)
        view_summaries = []
        for view in views[:5]:  # cap at 5 views to stay within token budget
            try:
                data = await self._rest.get_view_data(view["id"], max_rows=max_rows)
                view_summaries.append({"view": view["name"], "data_sample": data})
            except Exception as e:
                view_summaries.append({"view": view.get("name", "unknown"), "error": str(e)})
        return {"workbook": workbook, "views": view_summaries}


class AgentOrchestrator:
    """Runs the agentic tool-use loop until the model stops calling tools."""

    def __init__(self) -> None:
        self._llm = get_llm()
        self._executor = ToolExecutor()
        self._settings = get_settings()

    async def chat(
        self,
        user_message: str,
        history: Optional[List[LLMMessage]] = None,
        context: Optional[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None,
    ) -> AgentChatResponse:
        conv_id = conversation_id or str(uuid.uuid4())
        messages, system = build_messages(user_message, history or [], context)
        tool_calls_made: List[Dict[str, Any]] = []

        for _round in range(self._settings.agent_max_tool_rounds):
            response = await self._llm.chat(
                messages=messages,
                system=system,
                tools=TABLEAU_TOOLS,
                max_tokens=self._settings.agent_max_tokens,
                temperature=self._settings.agent_temperature,
            )

            stop_reason = response["stop_reason"]
            content_blocks = response["content"]

            # Collect any text from this turn
            text_parts: List[str] = []
            tool_use_blocks = []

            for block in content_blocks:
                if hasattr(block, "type"):
                    btype = block.type
                    if btype == "text":
                        text_parts.append(block.text)
                    elif btype == "tool_use":
                        tool_use_blocks.append(block)
                elif isinstance(block, dict):
                    if block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif block.get("type") == "tool_use":
                        tool_use_blocks.append(block)

            if stop_reason != "tool_use" or not tool_use_blocks:
                final_text = "\n".join(text_parts).strip()
                citations = extract_citations(tool_calls_made, self._settings.tableau_server_url)
                return AgentChatResponse(
                    response=final_text,
                    conversation_id=conv_id,
                    tool_calls_made=[c["tool_name"] for c in tool_calls_made],
                    citations=citations,
                )

            # Append assistant turn
            messages.append(LLMMessage(role="assistant", content=json.dumps([
                self._block_to_dict(b) for b in content_blocks
            ])))

            # Execute tools and build tool_result turn
            tool_results = []
            for block in tool_use_blocks:
                tool_id = getattr(block, "id", block.get("id", ""))
                tool_name = getattr(block, "name", block.get("name", ""))
                tool_input = getattr(block, "input", block.get("input", {}))

                tool_calls_made.append({"tool_name": tool_name, "args": tool_input})
                try:
                    result = await self._executor.execute(tool_name, tool_input)
                    result_text = json.dumps(result, default=str)
                except Exception as exc:
                    result_text = json.dumps({"error": str(exc)})

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_id,
                    "content": result_text,
                })

            messages.append(LLMMessage(role="user", content=json.dumps(tool_results)))

        return AgentChatResponse(
            response="Max tool rounds reached. The agent could not complete the request within the allowed steps.",
            conversation_id=conv_id,
            tool_calls_made=[c["tool_name"] for c in tool_calls_made],
        )

    async def stream(
        self,
        user_message: str,
        history: Optional[List[LLMMessage]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> AsyncIterator[str]:
        messages, system = build_messages(user_message, history or [], context)
        async for chunk in self._llm.stream(
            messages=messages,
            system=system,
            tools=TABLEAU_TOOLS,
            max_tokens=self._settings.agent_max_tokens,
            temperature=self._settings.agent_temperature,
        ):
            yield chunk

    @staticmethod
    def _block_to_dict(block: Any) -> Dict[str, Any]:
        if isinstance(block, dict):
            return block
        d: Dict[str, Any] = {"type": block.type}
        if block.type == "text":
            d["text"] = block.text
        elif block.type == "tool_use":
            d["id"] = block.id
            d["name"] = block.name
            d["input"] = block.input
        return d
