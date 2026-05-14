/**
 * Prisma client — singleton pattern.
 *
 * Without this, Next.js/Fastify hot-reload would spawn a fresh PrismaClient
 * on every reload and exhaust the Postgres connection pool within minutes.
 *
 * Pattern from skill-postgresql-prisma.md.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
