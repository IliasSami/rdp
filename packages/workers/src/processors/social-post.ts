/**
 * Social post publisher.
 *
 * Phase 1: stub. Phase 7 brings Meta Graph + LinkedIn + GBP API
 * publish calls, executed only AFTER an AgentDraft is approved
 * and a ScheduledPost row is APPROVED + SCHEDULED.
 */
import { createWorker } from '../base-worker';
import { socialPostJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const socialPostWorker = createWorker({
  name: QUEUE_NAMES.SOCIAL_POST,
  schema: socialPostJobSchema,
  concurrency: 5,
  handler: async (payload, { logger }) => {
    logger.info(
      { scheduledPostId: payload.scheduledPostId },
      '[stub] social-post invoked — Phase 7 will implement',
    );
    return { stub: true };
  },
});
