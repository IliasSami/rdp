/**
 * @rdp/ai — Claude agent infrastructure.
 *
 * Phase 1: scaffolding only. Phase 3+ adds the full createAgentCall loop,
 * tool definitions, and per-module prompt templates.
 */
export { getAnthropicClient, CLAUDE_MODEL, TOKEN_BUDGETS } from './client';
export { buildAgentContext } from './context-builder';
export {
  buildBaseSystemPrompt,
  type AgentContextBundle,
  type SystemPromptInput,
} from './prompt-templates/base-system';
