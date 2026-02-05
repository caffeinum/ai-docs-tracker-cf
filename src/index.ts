interface Env {
  TRACKER_ENDPOINT?: string;
}

function detectCodingAgent(headers: Headers): boolean {
  const accept = headers.get('accept') || '';
  return (
    accept.includes('text/markdown') ||
    (accept.includes('text/plain') && !accept.startsWith('text/html'))
  );
}

async function trackVisit(request: Request, env: Env): Promise<void> {
  const url = new URL(request.url);
  const payload = {
    host: request.headers.get('host'),
    path: url.pathname,
    accept: request.headers.get('accept'),
    ua: request.headers.get('user-agent')?.slice(0, 200),
    ts: Date.now(),
  };

  if (env.TRACKER_ENDPOINT) {
    await fetch(env.TRACKER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    console.log('[ai-docs-tracker] AI agent detected:', JSON.stringify(payload));
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (detectCodingAgent(request.headers)) {
      ctx.waitUntil(trackVisit(request, env));
    }
    return fetch(request);
  },
};
