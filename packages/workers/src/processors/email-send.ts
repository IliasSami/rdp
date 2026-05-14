/**
 * Email sender — Resend API.
 *
 * Used by reports (Phase 8) and outreach (Phase 6). Phase 1: stub.
 * NOTE: Even though email is "execution", it's only triggered AFTER
 * an upstream AgentDraft has been approved — HITL is preserved.
 */
import { createWorker } from '../base-worker';
import { emailSendJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const emailSendWorker = createWorker({
  name: QUEUE_NAMES.EMAIL_SEND,
  schema: emailSendJobSchema,
  concurrency: 10,
  handler: async (payload, { logger }) => {
    logger.info(
      { to: payload.to, subject: payload.subject },
      '[stub] email-send invoked — Phase 6/8 will implement',
    );
    return { stub: true };
  },
});
