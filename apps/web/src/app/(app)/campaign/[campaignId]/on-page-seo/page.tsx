/**
 * On-Page SEO module — Phase 1 placeholder.
 * Implementation lands in Phase 5.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function OnPageSeoPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="On-Page SEO"
      campaignId={params.campaignId}
      phase="Phase 5"
      description="Content inventory dashboard with GSC + GA4 overlay, TipTap editor with live 5-dimension scoring, SERP analysis brief generator, en-CA + fr-CA NLP pipelines."
    />
  );
}
