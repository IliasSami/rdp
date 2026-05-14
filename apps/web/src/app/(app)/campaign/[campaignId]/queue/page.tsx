/**
 * Approval queue — Phase 1 placeholder.
 *
 * The HITL backbone of RDP. Phase 2 implements per MASTER_BUILD_PROMPT §2.4:
 *   - Module-filter tabs (Local, Technical, On-Page, Off-Page, Social, Reports)
 *   - Per-draft card: module badge, action type, content preview,
 *     expandable agent reasoning, approve/edit/reject actions
 *   - Batch approve
 *   - Bell badge in sidebar updates via tRPC subscription
 */
import { CampaignModulePlaceholder } from '@/components/shared/CampaignModulePlaceholder';

export default function ApprovalQueuePage({
  params,
}: {
  params: { campaignId: string };
}): JSX.Element {
  return (
    <CampaignModulePlaceholder
      module="Approval Queue"
      campaignId={params.campaignId}
      phase="Phase 2"
      description="The HITL approval queue. Every AgentDraft from every module appears here for human review before execution. Tab filters by module, batch approval, expandable agent reasoning, edit-before-approve."
    />
  );
}
