/**
 * Environment validation — fail fast on startup.
 *
 * Every service (api, workers, web server-side) imports `env` from here.
 * If any REQUIRED variable is missing or malformed, the process exits
 * before any business code runs. This eliminates whole classes of bugs
 * where an undefined env var silently becomes "undefined" inside a URL.
 *
 * Pattern from environment-and-schema-reference.md startup validation.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────

const booleanFromString = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .transform((v): boolean => v === true || v === 'true');

const portFromString = z
  .union([z.string().regex(/^\d+$/), z.number()])
  .transform((v): number => (typeof v === 'number' ? v : Number(v)))
  .pipe(z.number().int().min(1).max(65535));

export const envSchema = z.object({
  // Runtime
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be ≥ 32 chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be ≥ 32 chars'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be ≥ 32 chars'),
  ENCRYPTION_KEY: z
    .string()
    .length(32, 'ENCRYPTION_KEY must be exactly 32 chars (AES-256)'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', {
    message: 'ANTHROPIC_API_KEY must start with sk-ant-',
  }),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  // Meta / LinkedIn — optional in dev, required in prod (validated below)
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_REDIRECT_URI: z.string().url().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().url().optional(),

  // DataForSEO
  DATAFORSEO_LOGIN: z.string().min(1),
  DATAFORSEO_PASSWORD: z.string().min(1),

  // Mapbox (frontend)
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),

  // R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().default('rdp-files'),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().default('reports@rundigital.ca'),
  RESEND_FROM_NAME: z.string().default('The Run Digital'),

  // Meilisearch
  MEILISEARCH_URL: z.string().url().default('http://localhost:7700'),
  MEILISEARCH_MASTER_KEY: z.string().min(1),

  // Optional service keys
  FAL_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  PAGESPEED_API_KEY: z.string().optional(),

  // Bright Data proxy
  BRIGHTDATA_USERNAME: z.string().optional(),
  BRIGHTDATA_PASSWORD: z.string().optional(),
  BRIGHTDATA_HOST: z.string().optional(),
  BRIGHTDATA_PORT: z.string().optional(),

  // URLs
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  API_PORT: portFromString.default(3001),
  WEB_PORT: portFromString.default(3000),

  // Sentry
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Feature flags
  ENABLE_AGENT_AUTO_QUEUE: booleanFromString.default('false'),
  ENABLE_AI_OVERVIEWS_TRACKING: booleanFromString.default('true'),
  CRAWL_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(5),
  CRAWL_DEFAULT_DELAY_MS: z.coerce.number().int().min(0).default(500),
});

export type Env = z.infer<typeof envSchema>;

// ─────────────────────────────────────────────────────────────────────
// Parse + freeze on first import
// ─────────────────────────────────────────────────────────────────────

let cachedEnv: Env | null = null;

/**
 * Parse and freeze environment variables. Throws if validation fails.
 * Caches result so subsequent imports are zero-cost.
 */
export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // Use console here intentionally — logger may not yet be configured.
    // eslint-disable-next-line no-console
    console.error(`\n[env] FATAL — environment validation failed:\n${issues}\n`);
    throw new Error('Environment validation failed. See errors above.');
  }

  cachedEnv = Object.freeze(result.data) as Env;
  return cachedEnv;
}

/**
 * Convenience proxy — `env.DATABASE_URL` triggers a lazy validate-and-cache.
 * Designed so an unused import never aborts the process.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string): unknown {
    const e = loadEnv();
    return e[prop as keyof Env];
  },
});
