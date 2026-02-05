# AI Docs Tracker - Cloudflare Worker

Track AI coding agent traffic on your documentation site. Detects visits from Claude Code, Cursor, OpenCode, Windsurf, and other AI coding assistants.

## One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/caffeinum/ai-docs-tracker-cf)

## How It Works

AI coding agents send a distinctive `Accept: text/markdown` header when fetching docs. This worker detects that pattern and logs/tracks the visit.

**Detection signals:**
- `Accept: text/markdown` (browsers never send this)
- `Accept: text/plain` prioritized over `text/html`

## Setup

1. Click the Deploy button above
2. After deployment, add a route in Cloudflare Dashboard:
   - Go to Workers & Pages → ai-docs-tracker → Settings → Triggers
   - Add route: `docs.yourdomain.com/*`

## Configuration

Set `TRACKER_ENDPOINT` environment variable to send events to your analytics backend:

```
TRACKER_ENDPOINT=https://your-api.com/track
```

Without this, events are logged to the console (visible in Workers logs).

## Event Payload

```json
{
  "host": "docs.example.com",
  "path": "/api/authentication",
  "accept": "text/plain;q=1.0, text/markdown;q=0.9, text/html;q=0.8",
  "ua": "Mozilla/5.0...",
  "ts": 1707123456789
}
```

## Local Development

```bash
npm install
npm run dev
```

Test with:
```bash
curl -H "Accept: text/markdown" http://localhost:8787/docs/test
```

## License

MIT
