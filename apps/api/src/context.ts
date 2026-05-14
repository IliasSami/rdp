/**
 * tRPC request context.
 *
 * Built on every request via @trpc/server/adapters/fastify.
 * Phase 1: returns a stub context with `user: null`. Phase 2 will
 * parse the JWT cookie and hydrate user + campaign-access roles.
 */
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { SessionUser } from '@rdp/types';
import { prisma } from '@rdp/db';
import { getRedis } from '@rdp/workers';

export interface Context {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: SessionUser | null;
  prisma: typeof prisma;
  redis: ReturnType<typeof getRedis>;
}

export async function createContext(
  opts: CreateFastifyContextOptions,
): Promise<Context> {
  // Phase 2: parse session cookie → SessionUser
  const user: SessionUser | null = null;

  return {
    req: opts.req,
    res: opts.res,
    user,
    prisma,
    redis: getRedis(),
  };
}
