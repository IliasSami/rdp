/**
 * Anthropic SDK client — singleton.
 *
 * Model pin per skill-claude-agents.md: `claude-sonnet-4-20250514`.
 * Centralized here so we change the version in one place when bumping.
 */
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@rdp/utils';

// Lazy singleton — only instantiates when first accessed, so workers
// or services that don't use AI don't pay the init cost.
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return _client;
}

/** Model identifier — single source of truth. */
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514' as const;

/** Default token budgets for common task shapes. */
export const TOKEN_BUDGETS = {
  draft: 2048, // single AgentDraft generation
  analysis: 4096, // SERP analysis, content scoring narrative
  report: 8192, // monthly report narrative pass
  classification: 256, // sentiment, intent, single-label tasks
} as const;
