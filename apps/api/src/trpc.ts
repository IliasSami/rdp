/**
 * tRPC initialization.
 *
 * Uses superjson so Date, Map, Set, BigInt etc. round-trip cleanly
 * between client and server (Prisma returns Date objects; without
 * superjson they'd come back as ISO strings on the frontend).
 *
 * Phase 1: only `publicProcedure` is defined. Phase 2 adds
 * `protectedProcedure` (requires session) and `campaignProcedure`
 * (requires CampaignAccess row).
 */
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

/**
 * Placeholder authed procedure — Phase 2 wires real session check.
 * Phase 1 throws UNAUTHORIZED whenever called so callers fail loudly.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required (Phase 2 will implement)',
    });
  }
  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
