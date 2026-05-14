/**
 * BullMQ queue registry.
 *
 * Per MASTER_BUILD_PROMPT.md Task 1.6, queues are:
 *   rank-scan, crawl, report-gen, social-post, email-send,
 *   agent-task, citation-check, gbp-sync
 *
 * Each queue's payload is typed via the corresponding schema in @rdp/types,
 * so callers get compile-time safety on `queue.add(name, payload)`.
 *
 * SYSTEM_INSTRUCTIONS.md: "BullMQ for ALL background work — never use
 * setTimeout for long-running tasks."
 */
import { Queue, type DefaultJobOptions, QueueEvents } from 'bullmq';
import type {
  RankScanJob,
  CrawlJob,
  ReportGenJob,
  SocialPostJob,
  EmailSendJob,
  AgentTaskJob,
  CitationCheckJob,
  GbpSyncJob,
} from '@rdp/types';
import { getRedis } from './redis';

export const QUEUE_NAMES = {
  RANK_SCAN: 'rank-scan',
  CRAWL: 'crawl',
  REPORT_GEN: 'report-gen',
  SOCIAL_POST: 'social-post',
  EMAIL_SEND: 'email-send',
  AGENT_TASK: 'agent-task',
  CITATION_CHECK: 'citation-check',
  GBP_SYNC: 'gbp-sync',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Default job options applied to every queue.
 * - 3 retries with exponential backoff
 * - Keep last 100 completed for observability, 1000 failed for triage
 */
const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { count: 100, age: 24 * 3600 }, // 100 jobs or 1 day
  removeOnFail: { count: 1000, age: 7 * 24 * 3600 }, // 1000 jobs or 7 days
};

// ─────────────────────────────────────────────────────────────────────
// Typed queue map — strongly-typed payload per queue
// ─────────────────────────────────────────────────────────────────────

export interface QueuePayloadMap {
  [QUEUE_NAMES.RANK_SCAN]: RankScanJob;
  [QUEUE_NAMES.CRAWL]: CrawlJob;
  [QUEUE_NAMES.REPORT_GEN]: ReportGenJob;
  [QUEUE_NAMES.SOCIAL_POST]: SocialPostJob;
  [QUEUE_NAMES.EMAIL_SEND]: EmailSendJob;
  [QUEUE_NAMES.AGENT_TASK]: AgentTaskJob;
  [QUEUE_NAMES.CITATION_CHECK]: CitationCheckJob;
  [QUEUE_NAMES.GBP_SYNC]: GbpSyncJob;
}

const _queues = new Map<QueueName, Queue>();

/**
 * Returns the singleton Queue for the given name. Creates it on first call.
 *
 * Use the type parameter for compile-time payload safety:
 *   const q = getQueue<RankScanJob>(QUEUE_NAMES.RANK_SCAN);
 *   await q.add('scan', { campaignId, keyword, ... });
 */
export function getQueue<T extends QueueName>(name: T): Queue<QueuePayloadMap[T]> {
  const existing = _queues.get(name);
  if (existing) return existing as Queue<QueuePayloadMap[T]>;

  const queue = new Queue<QueuePayloadMap[T]>(name, {
    connection: getRedis(),
    defaultJobOptions,
  });
  _queues.set(name, queue);
  return queue;
}

/**
 * Returns the QueueEvents instance for a queue — used for awaiting job
 * completion or listening to lifecycle events (Phase 2+ approval flows
 * may await job results).
 */
const _events = new Map<QueueName, QueueEvents>();

export function getQueueEvents(name: QueueName): QueueEvents {
  const existing = _events.get(name);
  if (existing) return existing;
  const events = new QueueEvents(name, { connection: getRedis() });
  _events.set(name, events);
  return events;
}

/**
 * Graceful shutdown — close every queue and event listener.
 * Called from runner.ts SIGTERM handler.
 */
export async function closeAllQueues(): Promise<void> {
  await Promise.all([
    ...[..._queues.values()].map((q) => q.close()),
    ...[..._events.values()].map((e) => e.close()),
  ]);
  _queues.clear();
  _events.clear();
}
