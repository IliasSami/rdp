/**
 * RAG context builder.
 *
 * Phase 1: stub that pulls AgentContext + the campaign's ClientProfile
 * and returns a context bundle suitable for buildBaseSystemPrompt.
 *
 * Phase 3+ will add pgvector retrieval over KnowledgeDoc chunks and
 * KnowledgeGraphNode embeddings (top-K = 5, per knowledge-agentic-ai-canadian-context.md).
 */
import { prisma } from '@rdp/db';
import { NotFoundError } from '@rdp/utils';
import type { AgentContextBundle } from './prompt-templates/base-system';

export interface BuildContextOptions {
  campaignId: string;
  /** The task description — used in Phase 3+ for vector retrieval. */
  query: string;
  /** Language override; defaults to first campaign language. */
  language?: 'en-CA' | 'fr-CA';
  /** Phase 3+ only: top-K RAG chunks to retrieve. */
  topK?: number;
}

export async function buildAgentContext(
  opts: BuildContextOptions,
): Promise<AgentContextBundle> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: opts.campaignId },
    include: {
      clientProfile: true,
      agentContext: true,
    },
  });

  if (!campaign) throw new NotFoundError('Campaign');

  const ctx = campaign.agentContext;
  const profile = campaign.clientProfile;

  // Derive a default business summary if AgentContext is fresh
  const businessSummary =
    ctx?.businessSummary && ctx.businessSummary.length > 0
      ? ctx.businessSummary
      : buildDefaultSummary(profile);

  const language: 'en-CA' | 'fr-CA' =
    opts.language ?? (campaign.language[0] === 'fr-CA' ? 'fr-CA' : 'en-CA');

  // Phase 3+: pull top-K RAG chunks via pgvector here
  const ragChunks: string[] = [];

  return {
    businessSummary,
    toneOfVoice:
      ctx?.toneOfVoice && ctx.toneOfVoice.length > 0
        ? ctx.toneOfVoice
        : profile?.toneOfVoice ?? '',
    doNotMention: ctx?.doNotMention ?? [],
    styleGuidelines: ctx?.styleGuidelines ?? '',
    recentChat: formatRecentChat(ctx?.chatHistory),
    ragChunks,
    language,
  };
}

function buildDefaultSummary(
  profile: {
    businessName: string;
    industry: string;
    primaryCity: string;
    description: string | null;
    usps: string | null;
    servicesProducts: string | null;
  } | null,
): string {
  if (!profile) return '';
  const parts = [
    `${profile.businessName} is a ${profile.industry} business in ${profile.primaryCity}, Canada.`,
  ];
  if (profile.description) parts.push(profile.description);
  if (profile.usps) parts.push(`Key differentiators: ${profile.usps}`);
  if (profile.servicesProducts)
    parts.push(`Services/Products: ${profile.servicesProducts}`);
  return parts.join('\n\n');
}

function formatRecentChat(chatHistory: unknown): string {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) return '';
  // Take last 10 messages to keep token usage bounded
  return chatHistory
    .slice(-10)
    .map((msg) => {
      if (
        typeof msg === 'object' &&
        msg !== null &&
        'role' in msg &&
        'content' in msg
      ) {
        const m = msg as { role: string; content: string };
        return `[${m.role}] ${m.content}`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}
