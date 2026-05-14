# Run Digital Platform (RDP) — Phase 1

> Agency-internal AI-powered SEO management platform for The Run Digital.
> **Phase 1: Monorepo Foundation** — schema, types, infrastructure, scaffolds.

---

## What's in Phase 1

| Layer | Status |
|---|---|
| `pnpm` workspace + Turborepo | ✅ Complete |
| Docker stack (TimescaleDB + Redis + Meilisearch) | ✅ Complete |
| Prisma schema (~40 models, all enums, indexes, vector + PostGIS + hypertable) | ✅ Complete |
| `@rdp/db` — singleton client + barrel exports | ✅ Complete |
| `@rdp/utils` — env validation, AES-256-GCM encryption, errors, Pino logger, Redis rate limiter | ✅ Complete |
| `@rdp/types` — shared Zod schemas (auth, campaign wizard, OAuth, agent drafts, all 8 BullMQ payloads) | ✅ Complete |
| `@rdp/ai` — Anthropic client + base system prompt + RAG context builder (scaffold) | ✅ Complete |
| `@rdp/nlp` — language detection scaffold (TF-IDF lands in Phase 5) | ✅ Complete |
| `@rdp/workers` — 8-queue registry + 8 typed worker stubs + scheduler scaffold + runner | ✅ Complete |
| `apps/api` — Fastify 4 + tRPC 11 + plugins + health route + global error handler | ✅ Complete |
| `apps/web` — Next.js 14 App Router + TanStack Query + tRPC client + 6-tab campaign sidebar | ✅ Complete |

Phase 1 deliberately ships **stubs** for module implementations — those land in Phases 3–8.

---

## Prerequisites

- **Node.js ≥ 20**
- **pnpm ≥ 9** (`corepack enable && corepack prepare pnpm@9.1.0 --activate`)
- **Docker + Docker Compose**

---

## Phase 1 verification (the path from zero to green)

```bash
# 1. Install
pnpm install

# 2. Boot infrastructure
cp .env.example .env
# (Edit .env: ENCRYPTION_KEY must be exactly 32 chars,
#  ANTHROPIC_API_KEY starts with sk-ant-, etc.)
pnpm docker:up

# 3. Apply schema
pnpm db:generate
pnpm db:migrate         # creates the initial migration
# Apply hypertable + vector indexes + PostGIS geography column:
docker compose exec -T postgres \
  psql -U rdp rdp_dev < packages/db/prisma/post-migration.sql

# 4. Seed default agency + admin user
pnpm db:seed

# 5. Typecheck — MUST be 0 errors
pnpm typecheck

# 6. Run the stack
pnpm dev                # runs api + web + workers in parallel
```

Then verify:

- **http://localhost:3000** — Next.js login placeholder. The green "API Status: OK" dot proves tRPC end-to-end is wired correctly.
- **http://localhost:3001/health** — returns `{ status: "ok", checks: { api, db, redis } }`.
- **http://localhost:3000/campaign/test-id** — campaign shell with the 6-tab sidebar (Overview, Local SEO, Technical SEO, On-Page SEO, Off-Page SEO, Social, Reports) + the bell-icon approval queue link. (`test-id` is just a path param; no DB lookup yet.)

### Common gotchas

- **`ENCRYPTION_KEY must be exactly 32 chars`** — yes, 32 ASCII characters, not 32 bytes hex.
- **`Cannot create extension "timescaledb"`** — the `postgres-init/01-extensions.sql` only runs on a fresh volume. If you've already booted, run `pnpm docker:down -v && pnpm docker:up`.
- **tRPC type errors after schema changes** — re-run `pnpm db:generate`.

---

## Repository layout

```
apps/
  api/        Fastify 4 + tRPC 11
  web/        Next.js 14 App Router
packages/
  db/         Prisma 5 + schema + seed
  types/      Shared Zod schemas
  utils/      env, errors, encryption, logger, rate-limit
  ai/         Anthropic client + RAG context builder
  nlp/        Language detection (Phase 5 brings TF-IDF + scoring)
  workers/    BullMQ 8 queues + runner
infra/
  docker/     Postgres init scripts
```

---

## Code standards (non-negotiable — see `SYSTEM_INSTRUCTIONS.md` in project knowledge)

1. **HITL absolute** — no AI agent ever executes a real-world action without an `AgentDraft` record + human approval + `ApprovedAction`.
2. **TypeScript strict, no `any`** — every function has explicit signatures.
3. **Encrypt OAuth tokens** — `Connection.credentials` is AES-256-GCM at rest.
4. **RBAC on every API route** — JWT verify + campaign-access check + Zod input validation.
5. **Schema first** — Prisma schema → migration → service code.
6. **Canadian context** — `en-CA` default; `fr-CA` supported everywhere agents and content scorers operate.

---

## Useful commands

```bash
pnpm dev                       # All apps in parallel
pnpm --filter @rdp/api dev     # Just the API
pnpm --filter @rdp/web dev     # Just the web app
pnpm --filter @rdp/workers dev # Just the workers
pnpm db:studio                 # Prisma Studio
pnpm db:reset                  # Drop + recreate + reseed (DESTROYS DATA)
pnpm docker:logs               # Tail Docker logs
pnpm typecheck                 # Strict typecheck across all packages
pnpm clean                     # Wipe node_modules, .next, dist
```

---

## What's next

**Phase 2 — Auth + Campaign Wizard + Shell** (~3–5 hours of build time):

- Better Auth in `apps/api` with Redis sessions, JWT cookies, RBAC roles
- OAuth2 PKCE flows for Google (unified GBP+GSC+GA4+Drive), Meta, LinkedIn
- WordPress connection via REST API app password
- 5-step campaign wizard with Google Places autocomplete
- Campaign-level access middleware on every route
- Real Approval Queue UI with module filter tabs + batch approve

Once Phase 1 is verified green on your machine, ship me the green light and we'll build Phase 2.
