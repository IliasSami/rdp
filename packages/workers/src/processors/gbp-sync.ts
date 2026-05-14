/**
 * GBP daily sync — refreshes insights, reviews, posts from GBP API.
 *
 * Phase 1: stub. Phase 3 brings the full GBP API v4.9 client
 * (knowledge-google-apis.md): getInsights, listReviews, listMedia,
 * listQAndA. Scheduled daily via BullMQ repeatable job (see schedulers/).
 */
import { createWorker } from '../base-worker';
import { gbpSyncJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const gbpSyncWorker = createWorker({
  name: QUEUE_NAMES.GBP_SYNC,
  schema: gbpSyncJobSchema,
  concurrency: 5,
  handler: async (payload, { logger }) => {
    logger.info(
      { campaignId: payload.campaignId, mode: payload.mode },
      '[stub] gbp-sync invoked — Phase 3 will implement',
    );
    return { stub: true };
  },
});
