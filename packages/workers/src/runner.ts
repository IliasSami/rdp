/**
 * Worker runner — single Node process that hosts all eight workers.
 *
 * Started via `pnpm --filter @rdp/workers dev` (tsx watch) or the
 * compiled `node dist/runner.js` in production.
 *
 * Handles SIGTERM/SIGINT to drain in-flight jobs before exit.
 */
import { prisma } from '@rdp/db';
import { createChildLogger, loadEnv } from '@rdp/utils';
import { closeAllQueues } from './queues';

// Validate env before any worker boots
loadEnv();

const logger = createChildLogger({ component: 'worker-runner' });

// Import every worker — side-effects register them with BullMQ
import { rankScanWorker } from './processors/rank-scan';
import { crawlWorker } from './processors/crawl';
import { reportGenWorker } from './processors/report-gen';
import { socialPostWorker } from './processors/social-post';
import { emailSendWorker } from './processors/email-send';
import { agentTaskWorker } from './processors/agent-task';
import { citationCheckWorker } from './processors/citation-check';
import { gbpSyncWorker } from './processors/gbp-sync';
import { registerSchedules } from './schedulers';

const workers = [
  rankScanWorker,
  crawlWorker,
  reportGenWorker,
  socialPostWorker,
  emailSendWorker,
  agentTaskWorker,
  citationCheckWorker,
  gbpSyncWorker,
] as const;

async function bootstrap(): Promise<void> {
  logger.info(
    { workerCount: workers.length },
    'RDP workers booting',
  );
  await registerSchedules();
  logger.info('RDP workers ready');
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received — draining workers');

  await Promise.all(workers.map((w) => w.close()));
  await closeAllQueues();
  await prisma.$disconnect();

  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});

bootstrap().catch((err: unknown) => {
  logger.fatal({ err }, 'Failed to boot workers');
  process.exit(1);
});
