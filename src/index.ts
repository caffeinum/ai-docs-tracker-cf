interface Env {
  TINYBIRD_TOKEN?: string;
  TINYBIRD_DATASOURCE?: string;
  TRACK_ALL?: string;
}

interface CFRequest extends Request {
  cf?: {
    country?: string;
    city?: string;
  };
}

type AgentType = 
  | 'claude-code' 
  | 'cursor' 
  | 'windsurf' 
  | 'opencode'
  | 'aider'
  | 'continue'
  | 'copilot'
  | 'unknown-ai'
  | 'human';

function detectAgentType(headers: Headers): { isAI: boolean; agentType: AgentType } {
  const accept = headers.get('accept') || '';
  const ua = (headers.get('user-agent') || '').toLowerCase();
  
  // AI agents request text/markdown - browsers never do this
  const wantsMarkdown = accept.includes('text/markdown');
  const wantsPlainText = accept.includes('text/plain') && !accept.startsWith('text/html');
  const isAI = wantsMarkdown || wantsPlainText;
  
  if (!isAI) {
    return { isAI: false, agentType: 'human' };
  }
  
  if (ua.includes('claude') || ua.includes('anthropic')) {
    return { isAI: true, agentType: 'claude-code' };
  }
  if (ua.includes('cursor')) {
    return { isAI: true, agentType: 'cursor' };
  }
  if (ua.includes('windsurf') || ua.includes('codeium')) {
    return { isAI: true, agentType: 'windsurf' };
  }
  if (ua.includes('opencode') || ua.includes('ohmycode')) {
    return { isAI: true, agentType: 'opencode' };
  }
  if (ua.includes('aider')) {
    return { isAI: true, agentType: 'aider' };
  }
  if (ua.includes('continue')) {
    return { isAI: true, agentType: 'continue' };
  }
  if (ua.includes('copilot') || ua.includes('github')) {
    return { isAI: true, agentType: 'copilot' };
  }
  
  return { isAI: true, agentType: 'unknown-ai' };
}

async function trackVisit(
  request: CFRequest, 
  env: Env, 
  isAI: boolean, 
  agentType: AgentType
): Promise<void> {
  const url = new URL(request.url);
  
  const event = {
    ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
    host: request.headers.get('host') || 'unknown',
    path: url.pathname,
    accept: request.headers.get('accept')?.slice(0, 500) || '',
    ua: request.headers.get('user-agent')?.slice(0, 500) || '',
    country: request.cf?.country || 'unknown',
    city: request.cf?.city || 'unknown',
    agent_type: agentType,
    is_ai: isAI ? 1 : 0,
  };

  if (env.TINYBIRD_TOKEN) {
    const datasource = env.TINYBIRD_DATASOURCE || 'ai_agent_events';
    const endpoint = `https://api.tinybird.co/v0/events?name=${datasource}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.TINYBIRD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        console.error('[ai-docs-tracker] tinybird error:', await response.text());
      }
    } catch (err) {
      console.error('[ai-docs-tracker] failed to send to tinybird:', err);
    }
  } else {
    console.log('[ai-docs-tracker]', JSON.stringify(event));
  }
}

export default {
  async fetch(request: CFRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { isAI, agentType } = detectAgentType(request.headers);
    
    const shouldTrack = isAI || env.TRACK_ALL === 'true';
    
    if (shouldTrack) {
      ctx.waitUntil(trackVisit(request, env, isAI, agentType));
    }
    
    return fetch(request);
  },
};
