const TRACKING_API = 'https://ai-docs-analytics-api.theisease.workers.dev/track';

interface CFRequest extends Request {
  cf?: {
    country?: string;
  };
}

async function trackVisit(request: CFRequest): Promise<void> {
  const url = new URL(request.url);

  await fetch(TRACKING_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: request.headers.get('host') || 'unknown',
      path: url.pathname,
      user_agent: request.headers.get('user-agent') || '',
      accept_header: request.headers.get('accept') || '',
      country: request.cf?.country || 'unknown',
    }),
  }).catch(() => {});
}

export default {
  async fetch(request: CFRequest, env: unknown, ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(trackVisit(request));
    return fetch(request);
  },
};
