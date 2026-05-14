/**
 * Campaign Overview — Phase 1 placeholder.
 * Phase 2+ shows campaign-wide KPI roll-up + recent activity feed.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function CampaignOverviewPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Overview"
      campaignId={params.campaignId}
      phase="Phase 2"
      description="Campaign-wide KPI roll-up: Local SEO health, technical issues, content score average, top wins. Recent activity feed of approved drafts."
    />
  );
}
