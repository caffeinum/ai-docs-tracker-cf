import { describe, it, expect } from 'vitest';

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

function makeHeaders(accept: string, ua = ''): Headers {
  const h = new Headers();
  h.set('accept', accept);
  if (ua) h.set('user-agent', ua);
  return h;
}

describe('AI Agent Detection', () => {
  describe('Accept header detection', () => {
    it('detects text/markdown as AI', () => {
      const result = detectAgentType(makeHeaders('text/markdown'));
      expect(result.isAI).toBe(true);
    });

    it('detects text/plain (not starting with html) as AI', () => {
      const result = detectAgentType(makeHeaders('text/plain, text/html'));
      expect(result.isAI).toBe(true);
    });

    it('does not detect text/html as AI', () => {
      const result = detectAgentType(makeHeaders('text/html, application/json'));
      expect(result.isAI).toBe(false);
      expect(result.agentType).toBe('human');
    });

    it('does not detect browser accept header as AI', () => {
      const result = detectAgentType(makeHeaders('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'));
      expect(result.isAI).toBe(false);
    });
  });

  describe('Agent type detection from User-Agent', () => {
    it('detects Claude Code', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'claude-code/1.0.0'));
      expect(result.agentType).toBe('claude-code');
    });

    it('detects Anthropic', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'Anthropic-Client/2.0'));
      expect(result.agentType).toBe('claude-code');
    });

    it('detects Cursor', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'cursor/0.45.0'));
      expect(result.agentType).toBe('cursor');
    });

    it('detects Windsurf', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'windsurf-agent/1.0'));
      expect(result.agentType).toBe('windsurf');
    });

    it('detects Codeium as Windsurf', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'codeium/1.0'));
      expect(result.agentType).toBe('windsurf');
    });

    it('detects OpenCode', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'opencode/0.1.0'));
      expect(result.agentType).toBe('opencode');
    });

    it('detects Aider', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'aider/0.50.0'));
      expect(result.agentType).toBe('aider');
    });

    it('detects Continue', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'continue-dev/1.0'));
      expect(result.agentType).toBe('continue');
    });

    it('detects GitHub Copilot', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'github-copilot/1.0'));
      expect(result.agentType).toBe('copilot');
    });

    it('returns unknown-ai for unrecognized UA with markdown accept', () => {
      const result = detectAgentType(makeHeaders('text/markdown', 'some-random-agent/1.0'));
      expect(result.isAI).toBe(true);
      expect(result.agentType).toBe('unknown-ai');
    });
  });
});
