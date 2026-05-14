/**
 * Agency campaigns list — Phase 2 fetches real data via tRPC.
 */
export default function CampaignsListPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-brand-500">
          All client campaigns managed by the agency.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-brand-700">
          Campaign list arrives in Phase 2
        </p>
        <p className="mt-1 text-xs text-brand-500">
          Once auth + campaign wizard are wired, this page will list active
          campaigns with KPIs.
        </p>
      </div>
    </div>
  );
}
