/**
 * Rank scan processor — geo-grid local pack rank tracking.
 *
 * Phase 1: stub. Phase 3 brings the full DataForSEO grid loop
 * (skill-geo-grid-tracking.md): generateGridPoints → fan out to
 * /v3/serp/google/local_pack/live/advanced → compute SoLV/ARP →
 * persist GridScan row.
 */
import { createWorker } from '../base-worker';
import { rankScanJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const rankScanWorker = createWorker({
  name: QUEUE_NAMES.RANK_SCAN,
  schema: rankScanJobSchema,
  concurrency: 2,
  handler: async (payload, { logger }) => {
    logger.info(
      {
        campaignId: payload.campaignId,
        keyword: payload.keyword,
        gridSize: payload.gridSize,
      },
      '[stub] rank-scan invoked — Phase 3 will implement',
    );
    return { stub: true, queuedAt: new Date().toISOString() };
  },
});
