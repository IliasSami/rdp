'use client';

import { api } from '@/lib/trpc';

/**
 * Login page — Phase 1 placeholder.
 *
 * Demonstrates end-to-end tRPC type safety by calling health.ping
 * and rendering the response. Phase 2 replaces with Better Auth form.
 */
export default function LoginPage(): JSX.Element {
  const ping = api.health.ping.useQuery();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-brand-200">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
            Run Digital Platform
          </h1>
          <p className="mt-1 text-sm text-brand-500">
            Agency-internal SEO management
          </p>
        </div>

        {/* Phase 2 placeholder */}
        <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50 p-4">
          <p className="text-sm font-medium text-brand-700">
            Authentication arrives in Phase 2
          </p>
          <p className="mt-1 text-xs text-brand-500">
            Better Auth + JWT + RBAC will replace this placeholder.
          </p>
        </div>

        {/* API health probe — verifies tRPC is wired correctly */}
        <div className="mt-6 rounded-lg bg-brand-50 p-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                ping.isSuccess
                  ? 'bg-status-approved'
                  : ping.isError
                    ? 'bg-status-rejected'
                    : 'bg-status-pending'
              }`}
            />
            <p className="text-xs font-medium text-brand-700">
              API Status: {ping.isLoading ? 'checking…' : ping.isSuccess ? 'OK' : 'unreachable'}
            </p>
          </div>
          {ping.data && (
            <pre className="mt-2 overflow-x-auto text-[10px] leading-relaxed text-brand-500">
              {JSON.stringify(ping.data, null, 2)}
            </pre>
          )}
          {ping.error && (
            <p className="mt-2 text-[10px] text-status-rejected">
              {ping.error.message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
