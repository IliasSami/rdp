/**
 * Recurring job scheduler.
 *
 * BullMQ "repeatable jobs" survive process restarts (state lives in Redis).
 * registerSchedules() is idempotent — calling it on every boot is fine;
 * BullMQ dedupes via the job-id pattern.
 *
 * Phase 1: scaffolding only. Phase 3+ populates real schedules:
 *   - gbp-sync: every campaign, daily at 04:00 America/Toronto
 *   - citation-check: every campaign, weekly Sunday 02:00
 *   - report-gen: monthly first business day at 09:00 (per Phase 8.4)
 *   - rank-scan: per campaign keyword cadence (weekly default)
 */
import { createChildLogger } from '@rdp/utils';

const logger = createChildLogger({ component: 'scheduler' });

export async function registerSchedules(): Promise<void> {
  logger.info('Scheduler registration — Phase 1 stub. Phase 3+ adds repeatable jobs.');
  // Example shape for Phase 3:
  //
  // const gbpQueue = getQueue(QUEUE_NAMES.GBP_SYNC);
  // const campaigns = await prisma.campaign.findMany({
  //   where: { status: 'ACTIVE' },
  //   select: { id: true, timezone: true },
  // });
  // for (const c of campaigns) {
  //   await gbpQueue.add(
  //     'daily-sync',
  //     { campaignId: c.id, mode: 'incremental' },
  //     {
  //       repeat: { pattern: '0 4 * * *', tz: c.timezone },
  //       jobId: `gbp-sync:${c.id}`, // dedupe key
  //     },
  //   );
  // }
}
