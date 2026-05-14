/**
 * Base worker factory.
 *
 * Wraps BullMQ's Worker with:
 *   - Zod payload validation at job entry (typed payloads from @rdp/types)
 *   - Per-job child logger bound with queue + jobId
 *   - Consistent error logging + rethrow so BullMQ marks job failed
 *
 * Pattern from skill-bullmq-workers.md.
 */
import { Worker, type Job, type Processor } from 'bullmq';
import type { ZodSchema } from 'zod';
import { createChildLogger, type Logger } from '@rdp/utils';
import { getRedis } from './redis';
import type { QueueName } from './queues';

export interface BaseWorkerConfig<T> {
  name: QueueName;
  schema: ZodSchema<T>;
  /** How many jobs this worker processes concurrently. */
  concurrency?: number;
  /**
   * Business logic — receives the validated payload and a scoped logger.
   * Throw to mark the job failed (BullMQ will retry per defaultJobOptions).
   */
  handler: (payload: T, ctx: { job: Job<T>; logger: Logger }) => Promise<unknown>;
}

export function createWorker<T>(config: BaseWorkerConfig<T>): Worker<T> {
  const processor: Processor<T> = async (job: Job<T>) => {
    const logger = createChildLogger({
      queue: config.name,
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
    });

    const startedAt = Date.now();
    logger.info('Job started');

    // Validate payload — fail fast if upstream sent malformed data
    const parseResult = config.schema.safeParse(job.data);
    if (!parseResult.success) {
      const issues = parseResult.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      logger.error({ issues }, 'Job payload validation failed');
      // Throw — BullMQ marks failed; do NOT retry malformed payloads
      throw new Error(`Invalid job payload: ${issues}`);
    }

    try {
      const result = await config.handler(parseResult.data, { job, logger });
      logger.info(
        { durationMs: Date.now() - startedAt },
        'Job completed',
      );
      return result;
    } catch (err) {
      logger.error(
        {
          err,
          durationMs: Date.now() - startedAt,
        },
        'Job failed',
      );
      throw err; // BullMQ records failure + applies retry policy
    }
  };

  const worker = new Worker<T>(config.name, processor, {
    connection: getRedis(),
    concurrency: config.concurrency ?? 1,
  });

  worker.on('error', (err) => {
    createChildLogger({ queue: config.name }).error(
      { err },
      'Worker internal error',
    );
  });

  return worker;
}
