# Tableau Analytics Agent — Backend

FastAPI backend that wraps the Tableau REST / VizQL / Pulse / Metadata APIs behind an AI agent powered by Claude.

## Quick start

```bash
cd backend/
cp .env.example .env        # fill in your credentials
./start_backend.sh
```

Server starts at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `TABLEAU_SERVER_URL` | ✅ | Base URL of your Tableau Server or Cloud |
| `TABLEAU_SITE_ID` | ✅ | Content URL of your site (blank = Default) |
| `TABLEAU_PAT_NAME` | ✅ | Personal Access Token name |
| `TABLEAU_PAT_SECRET` | ✅ | Personal Access Token secret |
| `LLM_PROVIDER` | ✅ | `claude` (openai / gemini are stubs) |
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |
| `ANTHROPIC_MODEL` | | Default: `claude-sonnet-4-6` |
| `AGENT_MAX_TOKENS` | | Default: 4096 |
| `AGENT_MAX_TOOL_ROUNDS` | | Default: 10 |
| `CORS_ORIGINS` | | Comma-separated list of allowed origins |

## Key endpoints

### Agent
| Method | Path | Description |
|---|---|---|
| `POST` | `/agent/chat` | JSON request/response chat |
| `POST` | `/agent/chat/stream` | Server-Sent Events streaming chat |

**Chat request body:**
```json
{
  "message": "What are the top 5 workbooks by view count?",
  "history": [],
  "conversation_id": "optional-uuid",
  "context": {}
}
```

### Tableau passthrough
| Method | Path | Description |
|---|---|---|
| `GET` | `/tableau/workbooks` | List workbooks |
| `GET` | `/tableau/views/{id}/data` | View data rows |
| `GET` | `/tableau/datasources` | List datasources |
| `POST` | `/tableau/datasources/query` | VizQL query |
| `GET` | `/tableau/pulse/metrics` | Pulse metrics |
| `POST` | `/tableau/pulse/insights` | Pulse insight bundle |
| `POST` | `/tableau/metadata/query` | Metadata GraphQL |
| `GET` | `/tableau/hyper/status` | Hyper API availability |
| `POST` | `/tableau/hyper/query` | Query a .hyper file |

### Export
| Method | Path | Description |
|---|---|---|
| `GET` | `/export/views/{id}/image` | PNG screenshot |
| `GET` | `/export/views/{id}/pdf` | PDF export |
| `GET` | `/export/views/{id}/csv` | CSV data |
| `GET` | `/export/workbooks/{id}/pdf` | Full workbook PDF |

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/signin` | Sign in (uses .env credentials) |
| `POST` | `/auth/signout` | Sign out |
| `GET` | `/auth/status` | Session status |

## Agent tools

The agent has access to 8 tools:

| Tool | What it does |
|---|---|
| `list_workbooks` | Browse workbooks on the site |
| `get_view_data` | Fetch data rows behind a view |
| `query_datasource` | Query a published datasource via VizQL |
| `get_pulse_insights` | Einstein AI / Pulse metric insights |
| `export_view` | Export view as PNG / PDF / CSV |
| `run_metadata_query` | GraphQL lineage and schema queries |
| `query_hyper_file` | SQL queries on local .hyper extracts |
| `summarize_dashboard` | Full workbook overview with data samples |

## Architecture

```
main.py                 FastAPI app, CORS, lifespan
config.py               pydantic-settings from .env
auth.py                 PAT auth, token refresh
tableau/
  client.py             httpx base client with auth headers
  rest_api.py           Tableau REST API v3.22
  vizql.py              VizQL Data Service
  pulse.py              Tableau Pulse / Einstein Insights
  metadata.py           Metadata API (GraphQL)
  export.py             Image / PDF / CSV exports
  hyper.py              Hyper API (optional, graceful fallback)
agent/
  base.py               Abstract LLM interface
  claude.py             Anthropic SDK (prompt caching enabled)
  openai_llm.py         OpenAI stub
  gemini.py             Gemini stub
  router.py             LLM provider selector
  tools.py              Anthropic-format tool schemas
  cache.py              In-memory TTL cache for tool results
  citations.py          Source attribution builder
  context.py            System prompt + message builder
  orchestrator.py       Agentic tool-use loop
routers/
  auth.py               /auth endpoints
  agent.py              /agent endpoints (JSON + SSE)
  tableau.py            /tableau passthrough endpoints
  export.py             /export download endpoints
models/
  session.py            Auth request/response models
  response.py           Agent chat models
  tableau.py            Tableau request models
```

## Hyper API (optional)

`tableauhyperapi` is commented out in `requirements.txt`. To enable local `.hyper` file queries:

1. Uncomment `tableauhyperapi` in `requirements.txt`
2. Re-run `pip install -r requirements.txt`
3. Use the `query_hyper_file` tool or `POST /tableau/hyper/query`

The application starts and runs normally without it.
