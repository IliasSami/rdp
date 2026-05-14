/**
 * Citation NAP scanner.
 *
 * Phase 1: stub. Phase 3 runs DataForSEO citations check across
 * Canadian directory tier list (knowledge-canadian-context.md) and
 * computes per-directory NAP accuracy.
 */
import { createWorker } from '../base-worker';
import { citationCheckJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const citationCheckWorker = createWorker({
  name: QUEUE_NAMES.CITATION_CHECK,
  schema: citationCheckJobSchema,
  concurrency: 2,
  handler: async (payload, { logger }) => {
    logger.info(
      { campaignId: payload.campaignId },
      '[stub] citation-check invoked — Phase 3 will implement',
    );
    return { stub: true };
  },
});
