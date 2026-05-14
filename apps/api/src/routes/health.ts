/**
 * /health endpoint.
 *
 * Used by:
 *   - Docker healthchecks (production)
 *   - Uptime monitors
 *   - Manual verification: `curl localhost:3001/health`
 *
 * Returns 200 only when DB + Redis are both reachable.
 */
import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const checks = {
      api: 'ok' as const,
      db: 'unknown' as 'ok' | 'fail' | 'unknown',
      redis: 'unknown' as 'ok' | 'fail' | 'unknown',
    };

    // DB check
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      checks.db = 'ok';
    } catch (err) {
      app.log.error({ err }, 'Health: DB check failed');
      checks.db = 'fail';
    }

    // Redis check
    try {
      const pong = await app.redis.ping();
      checks.redis = pong === 'PONG' ? 'ok' : 'fail';
    } catch (err) {
      app.log.error({ err }, 'Health: Redis check failed');
      checks.redis = 'fail';
    }

    const healthy = checks.db === 'ok' && checks.redis === 'ok';
    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
