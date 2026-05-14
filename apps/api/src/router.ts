/**
 * tRPC app router — the single root router.
 *
 * Phase 1 exposes only `health.ping` so the frontend can verify
 * end-to-end type safety is wired. Phases 2+ mount real routers:
 *   - auth   (login, logout, me)
 *   - campaigns (CRUD, wizard)
 *   - localSeo, technicalSeo, onPageSeo, offPageSeo, social, reporting
 *   - drafts (approval queue)
 *
 * The `AppRouter` type is consumed by the frontend's createTRPCReact<AppRouter>().
 */
import { router, publicProcedure } from './trpc';

export const appRouter = router({
  health: router({
    ping: publicProcedure.query(() => ({
      ok: true as const,
      timestamp: new Date(),
      message: 'RDP API alive',
    })),
  }),
  // auth: authRouter,        // Phase 2
  // campaigns: campaignRouter, // Phase 2
  // ...
});

export type AppRouter = typeof appRouter;
