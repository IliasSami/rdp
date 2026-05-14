/**
 * Agent task processor — dispatches an agent run.
 *
 * Phase 1: stub. Phase 3+ brings the full agent loop:
 *   1. buildAgentContext (RAG retrieval)
 *   2. Anthropic messages.create with tool definitions
 *   3. Tool-use loop until model produces create_agent_draft call
 *   4. Insert AgentDraft row (PENDING status — awaits human approval)
 *
 * CRITICAL: This worker produces drafts only. It NEVER executes
 * real-world actions. See SYSTEM_INSTRUCTIONS.md HITL contract.
 */
import { createWorker } from '../base-worker';
import { agentTaskJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const agentTaskWorker = createWorker({
  name: QUEUE_NAMES.AGENT_TASK,
  schema: agentTaskJobSchema,
  concurrency: 3,
  handler: async (payload, { logger }) => {
    logger.info(
      {
        campaignId: payload.campaignId,
        module: payload.module,
        taskType: payload.taskType,
      },
      '[stub] agent-task invoked — Phase 3+ will implement draft generation',
    );
    return { stub: true, draftId: null };
  },
});
