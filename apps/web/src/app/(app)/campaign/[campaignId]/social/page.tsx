/**
 * Social module — Phase 1 placeholder.
 * Implementation lands in Phase 7.
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function SocialPage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Social"
      campaignId={params.campaignId}
      phase="Phase 7"
      description="Excel calendar import (SheetJS), Claude-generated platform-appropriate copy + fal.ai images, BullMQ-scheduled publishing to Facebook/Instagram/LinkedIn/GBP, engagement agent with comment reply queue."
    />
  );
}
