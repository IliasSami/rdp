import { Sidebar } from '@/components/Sidebar';

/**
 * Per-campaign layout — renders the 6-tab sidebar on the left and
 * the active module page on the right.
 *
 * Phase 2 wires CampaignAccess check: if the current user has no
 * access to this campaignId, redirect to /campaigns with a flash.
 */
export default function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaignId: string };
}): JSX.Element {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar campaignId={params.campaignId} pendingDraftCount={0} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
