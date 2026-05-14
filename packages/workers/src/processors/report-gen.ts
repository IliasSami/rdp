/**
 * Report generation processor.
 *
 * Phase 1: stub. Phase 8 brings DOCX template fill + Claude
 * narrative generation + PDF conversion + R2 upload + Resend delivery.
 */
import { createWorker } from '../base-worker';
import { reportGenJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const reportGenWorker = createWorker({
  name: QUEUE_NAMES.REPORT_GEN,
  schema: reportGenJobSchema,
  concurrency: 1,
  handler: async (payload, { logger }) => {
    logger.info(
      {
        campaignId: payload.campaignId,
        period: `${payload.periodStart} → ${payload.periodEnd}`,
      },
      '[stub] report-gen invoked — Phase 8 will implement',
    );
    return { stub: true };
  },
});
