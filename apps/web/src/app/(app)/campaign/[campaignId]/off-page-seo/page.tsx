/**
 * Off-Page SEO module — Phase 1 placeholder.
 * Implementation lands in Phase 6.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function OffPageSeoPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Off-Page SEO"
      campaignId={params.campaignId}
      phase="Phase 6"
      description="DataForSEO backlink dashboard, competitor link gap analysis, Canadian-priority citation builder, AI-personalized outreach with Resend delivery + 7-day follow-up sequencer."
    />
  );
}
