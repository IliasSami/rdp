/**
 * Reports module — Phase 1 placeholder.
 * Implementation lands in Phase 8.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function ReportsPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Reports"
      campaignId={params.campaignId}
      phase="Phase 8"
      description="DOCX template system with placeholder fill, monthly data collection across all 5 modules with MoM/YoY deltas, Claude narrative writer for non-technical owners, PDF export via LibreOffice, Resend delivery."
    />
  );
}
