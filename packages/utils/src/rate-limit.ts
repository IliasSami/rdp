/**
 * Redis-backed rate limiter — sliding window counter.
 *
 * Per SYSTEM_INSTRUCTIONS.md: "Rate limit every endpoint — Redis-backed
 * rate limiter." Used both by Fastify's per-route limiter and by job
 * submission throttles (per-campaign queue flood protection).
 *
 * Sliding window via sorted set: every hit gets a unique score (timestamp).
 * Old entries are pruned in the same MULTI as the new write.
 */
import type { Redis } from 'ioredis';
import { RateLimitError } from './errors';

export interface RateLimitOptions {
  /** Unique key namespace — e.g. `rate:user:${userId}:gridscan` */
  key: string;
  /** Max hits permitted within the window. */
  max: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
  /** Seconds to wait before retrying — populated when `allowed === false`. */
  retryAfterSeconds?: number;
}

/**
 * Check + record a hit against the limit.
 * Returns `allowed: false` instead of throwing; let the caller decide.
 */
export async function checkRateLimit(
  redis: Redis,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;

  const pipeline = redis.multi();
  // 1. Drop entries older than the window
  pipeline.zremrangebyscore(opts.key, 0, windowStart);
  // 2. Count what remains
  pipeline.zcard(opts.key);
  // 3. Add this hit
  pipeline.zadd(opts.key, now, member);
  // 4. Set/refresh TTL so the key auto-expires after the window
  pipeline.pexpire(opts.key, opts.windowMs + 1000);

  const results = await pipeline.exec();
  if (!results) {
    // Redis failure — fail open in dev, you'd want to fail closed in prod
    return { allowed: true, remaining: opts.max, resetAt: now + opts.windowMs };
  }

  // results[1] = [error, count] from zcard (count BEFORE this hit was added)
  const zcardResult = results[1];
  const countBefore =
    Array.isArray(zcardResult) && typeof zcardResult[1] === 'number'
      ? zcardResult[1]
      : 0;
  const countAfter = countBefore + 1;

  if (countAfter > opts.max) {
    // Roll back the hit we just added — over the limit
    await redis.zrem(opts.key, member);
    const retryAfterSeconds = Math.ceil(opts.windowMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + opts.windowMs,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, opts.max - countAfter),
    resetAt: now + opts.windowMs,
  };
}

/**
 * Throwing variant — convenience for service-layer call sites.
 */
export async function enforceRateLimit(
  redis: Redis,
  opts: RateLimitOptions,
): Promise<void> {
  const result = await checkRateLimit(redis, opts);
  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }
}
