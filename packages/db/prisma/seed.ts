/**
 * Database seed — runs `pnpm db:seed`.
 *
 * Creates:
 *   - Default agency: "The Run Digital"
 *   - Super admin user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *
 * Idempotent via upsert on unique email. Safe to re-run.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as crypto from 'node:crypto';

const prisma = new PrismaClient();

/**
 * Lightweight password hash for seed only.
 * Production auth (Phase 2) will use bcrypt or argon2 via @rdp/utils.
 */
function hashPasswordForSeed(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@rundigital.ca';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme_dev_only';

  // 1. Default agency
  const agency = await prisma.agency.upsert({
    where: { slug: 'the-run-digital' },
    update: {},
    create: {
      name: 'The Run Digital',
      slug: 'the-run-digital',
      timezone: 'America/Toronto',
      defaultLang: 'en-CA',
    },
  });
  console.log(`[seed] Agency: ${agency.name} (${agency.id})`);

  // 2. Super admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      agencyId: agency.id,
      email: adminEmail,
      name: 'RDP Admin',
      role: UserRole.SUPER_ADMIN,
      passwordHash: hashPasswordForSeed(adminPassword),
      emailVerified: true,
    },
  });
  console.log(`[seed] Super admin: ${admin.email} (${admin.id})`);
  console.log(`[seed] Done.`);
}

main()
  .catch((err: unknown) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
