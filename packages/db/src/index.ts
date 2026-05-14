/**
 * @rdp/db — Database access layer.
 *
 * Re-exports the singleton Prisma client and all generated types/enums
 * so consumers can `import { prisma, CampaignStatus, type Campaign } from '@rdp/db'`
 * without ever importing from `@prisma/client` directly.
 */
export { prisma, default } from './client';
export * from '@prisma/client';
export { Prisma } from '@prisma/client';
