# AI Docs Tracker - Cloudflare Worker

Track AI coding agent traffic on your documentation site. Detects visits from Claude Code, Cursor, OpenCode, Windsurf, and other AI coding assistants.

## One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/caffeinum/ai-docs-tracker-cf)

## How It Works

AI coding agents send `Accept: text/markdown` header when fetching docs - browsers never do this. This worker detects that pattern and streams events to Tinybird.

## Setup

1. Click the Deploy button above
2. Set environment variables (see Configuration below)
3. Add a route in Cloudflare Dashboard:
   - Go to Workers & Pages → ai-docs-tracker → Settings → Triggers
   - Add route: `docs.yourdomain.com/*`

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `TINYBIRD_TOKEN` | Yes | Your Tinybird admin token |
| `TINYBIRD_DATASOURCE` | No | Datasource name (default: `ai_agent_events`) |
| `TRACK_ALL` | No | Set to `true` to also track human visits |

Set via Cloudflare Dashboard: Workers → ai-docs-tracker → Settings → Variables

## Analytics Backend

Deploy the Tinybird data sources and pipes from [ai-docs-analytics](https://github.com/caffeinum/ai-docs-analytics).

## Detected Agents

| Agent Type | Detection |
|------------|-----------|
| `claude-code` | UA contains "claude" or "anthropic" |
| `cursor` | UA contains "cursor" |
| `windsurf` | UA contains "windsurf" or "codeium" |
| `opencode` | UA contains "opencode" |
| `aider` | UA contains "aider" |
| `continue` | UA contains "continue" |
| `copilot` | UA contains "copilot" or "github" |
| `unknown-ai` | Accept header detected, unknown UA |

## Event Schema

```json
{
  "ts": "2024-01-15 10:30:00",
  "host": "docs.example.com",
  "path": "/api/authentication",
  "accept": "text/markdown, text/plain",
  "ua": "Mozilla/5.0...",
  "country": "US",
  "city": "San Francisco",
  "agent_type": "claude-code",
  "is_ai": 1
}
```

## Local Development

```bash
npm install
npm run dev
```

Test:
```bash
curl -H "Accept: text/markdown" http://localhost:8787/docs/test
```

## License

MIT
