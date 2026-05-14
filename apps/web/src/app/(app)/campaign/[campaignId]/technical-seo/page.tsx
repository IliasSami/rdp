/**
 * Technical SEO module — Phase 1 placeholder.
 * Implementation lands in Phase 4.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function TechnicalSeoPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Technical SEO"
      campaignId={params.campaignId}
      phase="Phase 4"
      description="Playwright sitemap crawler with dual bot mode (Googlebot + LLM bots), full issue detection across 7 categories, Cytoscape.js knowledge graph (6 visualizations), and WP REST API auto-fix bridge."
    />
  );
}
