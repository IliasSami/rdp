/**
 * Local SEO module — Phase 1 placeholder.
 * Implementation lands in Phase 3.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function LocalSeoPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Local SEO"
      campaignId={params.campaignId}
      phase="Phase 3"
      description="GBP dashboard with KPIs, geo-grid rank tracker on Mapbox, reviews + AI-drafted responses, citation builder with Canadian directory priority list, and a context-aware Local SEO agent."
    />
  );
}
