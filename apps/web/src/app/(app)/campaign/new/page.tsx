/**
 * Campaign creation wizard — Phase 2 implements the 5 steps per
 * MASTER_BUILD_PROMPT.md §2.2:
 *
 *   Step 1: identity + Google Places autocomplete
 *   Step 2: OAuth connections (GBP/GSC/GA4 required)
 *   Step 3: competitors
 *   Step 4: business knowledge + brand assets
 *   Step 5: review + launch
 */
export default function NewCampaignPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
          New campaign
        </h1>
        <p className="mt-1 text-sm text-brand-500">
          5-step wizard arrives in Phase 2.
        </p>
      </header>

      <ol className="space-y-3">
        {[
          'Identity & location',
          'Connect accounts (GBP, GSC, GA4)',
          'Competitors',
          'Business knowledge',
          'Review & launch',
        ].map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-brand-200"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-brand-900">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
