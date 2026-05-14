/**
 * tRPC React client.
 *
 * `api.health.ping.useQuery()` is fully type-safe end-to-end —
 * the AppRouter import from @rdp/api carries every procedure signature.
 *
 * Phase 1: only health.ping wired. Phases 2+ add real procedures.
 */
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@rdp/api/router';

export const api = createTRPCReact<AppRouter>();
