import { Construction } from 'lucide-react';

interface Props {
  module: string;
  campaignId: string;
  phase: string;
  description: string;
}

/**
 * Placeholder card used by every module page in Phase 1.
 * Renders the module name + which phase will build it + spec preview.
 */
export function CampaignModulePlaceholder({
  module,
  campaignId,
  phase,
  description,
}: Props): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
          {module}
        </h1>
        <p className="mt-1 font-mono text-xs text-brand-400">
          campaign: {campaignId}
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Construction className="h-6 w-6 text-brand-700" />
          </div>
          <p className="text-sm font-semibold text-brand-700">
            {module} arrives in {phase}
          </p>
          <p className="mt-2 text-sm text-brand-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
