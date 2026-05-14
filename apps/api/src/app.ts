/**
 * Fastify app builder.
 *
 * Plugin set per MASTER_BUILD_PROMPT.md Task 1.7:
 *   @fastify/cors, @fastify/helmet, @fastify/compress, @fastify/rate-limit,
 *   @fastify/sensible, @fastify/cookie
 *
 * Decorates instance with `prisma` and `redis` so route handlers can use
 * `request.server.prisma` etc. without re-importing.
 *
 * tRPC mounted at /trpc — frontend calls it via @trpc/react-query.
 */
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { ZodError } from 'zod';

import { prisma } from '@rdp/db';
import { env, logger, isAppError, AppError } from '@rdp/utils';
import { getRedis } from '@rdp/workers';

import { appRouter, type AppRouter } from './router';
import { createContext } from './context';
import { healthRoutes } from './routes/health';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
    redis: ReturnType<typeof getRedis>;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10 MB — enough for DOCX template uploads
    disableRequestLogging: env.NODE_ENV === 'production',
  });

  // ───────────────────────────────────────────────────────────────────
  // Decorators — make singletons accessible from any handler
  // ───────────────────────────────────────────────────────────────────
  app.decorate('prisma', prisma);
  app.decorate('redis', getRedis());

  // ───────────────────────────────────────────────────────────────────
  // Core plugins
  // ───────────────────────────────────────────────────────────────────
  await app.register(helmet, {
    // Allow Mapbox tiles + Cloudflare R2 image hosts via app-level CSP later.
    // For Phase 1 we keep helmet defaults; tighten in Phase 9.
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  });

  await app.register(cors, {
    origin: [env.NEXT_PUBLIC_APP_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(compress, { global: true });
  await app.register(sensible);
  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });

  // Global default — per-route overrides in Phase 2+
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    redis: getRedis(),
    keyGenerator: (req) => {
      // Phase 2 will swap to userId once auth is wired
      return req.ip;
    },
  });

  // ───────────────────────────────────────────────────────────────────
  // Health route — used by docker healthcheck + uptime monitors
  // ───────────────────────────────────────────────────────────────────
  await app.register(healthRoutes);

  // ───────────────────────────────────────────────────────────────────
  // tRPC — mounted at /trpc
  // ───────────────────────────────────────────────────────────────────
  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        app.log.error(
          { path, err: error },
          'tRPC procedure error',
        );
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  });

  // ───────────────────────────────────────────────────────────────────
  // Global error handler — translates AppError + ZodError → HTTP
  // ───────────────────────────────────────────────────────────────────
  app.setErrorHandler((err, request, reply) => {
    if (isAppError(err)) {
      const payload = err.toJSON();
      request.log.warn({ err, code: payload.code }, 'AppError thrown');
      return reply.status(payload.statusCode).send(payload);
    }

    if (err instanceof ZodError) {
      request.log.warn({ issues: err.issues }, 'Zod validation failed');
      return reply.status(400).send({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        issues: err.issues,
      });
    }

    request.log.error({ err }, 'Unhandled error');
    return reply.status(500).send(
      new AppError('Internal server error', 500, 'INTERNAL_ERROR', {}, false).toJSON(),
    );
  });

  // ───────────────────────────────────────────────────────────────────
  // Not-found handler
  // ───────────────────────────────────────────────────────────────────
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: `Route ${request.method} ${request.url} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });

  return app;
}
