/**
 * Shared Redis connection for BullMQ.
 *
 * BullMQ requires a connection where `maxRetriesPerRequest` is `null`
 * — otherwise long-blocking BLPOP calls would time out repeatedly.
 */
import { Redis, type RedisOptions } from 'ioredis';
import { env } from '@rdp/utils';

let _redis: Redis | null = null;

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  // Reconnect on transient failures
  retryStrategy(times: number): number {
    return Math.min(times * 200, 5000);
  },
};

export function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new Redis(env.REDIS_URL, redisOptions);
  return _redis;
}

/** Test-only — allows callers to inject a stub Redis. */
export function setRedisForTest(redis: Redis): void {
  _redis = redis;
}
