/**
 * @rdp/types — Shared Zod schemas + inferred TypeScript types.
 *
 * Pattern from SYSTEM_INSTRUCTIONS.md:
 *   "Zod schemas for ALL external data — API responses, env vars,
 *    form inputs, job payloads."
 *
 * All schemas defined here are usable on both frontend (forms) and
 * backend (API validation, job payloads) — single source of truth.
 *
 * Enums are re-exported from @rdp/db so we never duplicate.
 */
import { z } from 'zod';
import {
  CampaignStatus,
  CampaignRole,
  ConnectionType,
  ConnectionStatus,
  ModuleType,
  AgentDraftStatus,
  AgentTaskType,
  IssueSeverity,
  IssueCategory,
  NodeType,
  CrawlSessionStatus,
  ReviewSource,
  ReviewSentiment,
  SocialPlatform,
  SocialPostStatus,
  ReportStatus,
  UserRole,
} from '@rdp/db';

// Re-export enums for downstream consumers
export {
  CampaignStatus,
  CampaignRole,
  ConnectionType,
  ConnectionStatus,
  ModuleType,
  AgentDraftStatus,
  AgentTaskType,
  IssueSeverity,
  IssueCategory,
  NodeType,
  CrawlSessionStatus,
  ReviewSource,
  ReviewSentiment,
  SocialPlatform,
  SocialPostStatus,
  ReportStatus,
  UserRole,
};

// ═════════════════════════════════════════════════════════════════════
// Common primitives
// ═════════════════════════════════════════════════════════════════════

export const cuidSchema = z.string().cuid();
export const isoDateSchema = z.string().datetime();
export const langCodeSchema = z.enum(['en-CA', 'fr-CA']);
export const urlSchema = z.string().url();

// ═════════════════════════════════════════════════════════════════════
// Auth
// ═════════════════════════════════════════════════════════════════════

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const sessionUserSchema = z.object({
  id: cuidSchema,
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  agencyId: cuidSchema,
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

// ═════════════════════════════════════════════════════════════════════
// Campaign wizard inputs
// ═════════════════════════════════════════════════════════════════════

export const campaignStep1Schema = z.object({
  businessName: z.string().min(1).max(200),
  websiteUrl: urlSchema,
  primaryCity: z.string().min(1).max(120),
  primaryRegion: z.string().max(120).optional(),
  industry: z.string().min(1).max(120),
  languages: z.array(langCodeSchema).min(1).default(['en-CA']),
  timezone: z.string().default('America/Toronto'),
  // From Google Places autocomplete (Phase 2)
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
});
export type CampaignStep1Input = z.infer<typeof campaignStep1Schema>;

export const campaignStep3CompetitorSchema = z.object({
  name: z.string().min(1).max(200),
  websiteUrl: urlSchema.optional(),
  gbpName: z.string().optional(),
});
export const campaignStep3Schema = z.object({
  competitors: z.array(campaignStep3CompetitorSchema).max(5),
});
export type CampaignStep3Input = z.infer<typeof campaignStep3Schema>;

export const campaignStep4Schema = z.object({
  description: z.string().max(5000).optional(),
  usps: z.string().max(2000).optional(),
  servicesProducts: z.string().max(5000).optional(),
  targetAudience: z.string().max(2000).optional(),
  toneOfVoice: z.string().max(1000).optional(),
  brandGuidelinesUrl: urlSchema.optional(),
});
export type CampaignStep4Input = z.infer<typeof campaignStep4Schema>;

export const createCampaignSchema = z.object({
  step1: campaignStep1Schema,
  step3: campaignStep3Schema.optional(),
  step4: campaignStep4Schema.optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// ═════════════════════════════════════════════════════════════════════
// Connection / OAuth
// ═════════════════════════════════════════════════════════════════════

export const oauthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().int().optional(), // epoch ms
  scope: z.string().optional(),
  tokenType: z.string().default('Bearer'),
});
export type OauthTokens = z.infer<typeof oauthTokensSchema>;

export const wordpressCredentialsSchema = z.object({
  siteUrl: urlSchema,
  username: z.string().min(1),
  appPassword: z.string().min(1),
});
export type WordPressCredentials = z.infer<typeof wordpressCredentialsSchema>;

// ═════════════════════════════════════════════════════════════════════
// Agent draft payloads — discriminated union keyed on `actionType`
// Phase 1 defines the shape; later phases add concrete payload schemas.
// ═════════════════════════════════════════════════════════════════════

export const agentDraftBaseSchema = z.object({
  campaignId: cuidSchema,
  module: z.nativeEnum(ModuleType),
  actionType: z.nativeEnum(AgentTaskType),
  targetId: z.string().optional(),
  targetUrl: urlSchema.optional(),
  reasoning: z.string().min(1),
});

export const reviewResponsePayloadSchema = z.object({
  reviewId: cuidSchema,
  responseText: z.string().min(1).max(4096),
  language: langCodeSchema,
});
export type ReviewResponsePayload = z.infer<typeof reviewResponsePayloadSchema>;

export const gbpPostPayloadSchema = z.object({
  postType: z.enum(['WHATS_NEW', 'OFFER', 'EVENT', 'PRODUCT']),
  title: z.string().max(58).optional(),
  body: z.string().min(1).max(1500),
  ctaType: z.string().optional(),
  ctaUrl: urlSchema.optional(),
  imageUrl: urlSchema.optional(),
});
export type GbpPostPayload = z.infer<typeof gbpPostPayloadSchema>;

// Generic placeholder for payload types still to be specified in later phases
export const genericPayloadSchema = z.record(z.string(), z.unknown());

// ═════════════════════════════════════════════════════════════════════
// Geo-grid scan
// ═════════════════════════════════════════════════════════════════════

export const gridScanRequestSchema = z.object({
  campaignId: cuidSchema,
  keyword: z.string().min(1).max(200),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  gridSize: z.number().int().min(3).max(13),
  radiusKm: z.number().positive().max(50),
  language: z.enum(['en', 'fr']).default('en'),
});
export type GridScanRequest = z.infer<typeof gridScanRequestSchema>;

export const gridPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  row: z.number().int(),
  col: z.number().int(),
  rank: z.number().int().nullable(),
  competitorRanks: z.record(z.string(), z.number().int().nullable()).optional(),
});
export type GridPoint = z.infer<typeof gridPointSchema>;

// ═════════════════════════════════════════════════════════════════════
// Content scoring (Phase 5 will populate)
// ═════════════════════════════════════════════════════════════════════

export const contentScoreBreakdownSchema = z.object({
  totalScore: z.number().int().min(0).max(100),
  keywordScore: z.number().int().min(0).max(20),
  structureScore: z.number().int().min(0).max(20),
  entityScore: z.number().int().min(0).max(25),
  nlpScore: z.number().int().min(0).max(20),
  geoScore: z.number().int().min(0).max(15),
  termChecklist: z.array(
    z.object({
      term: z.string(),
      priority: z.enum(['required', 'recommended', 'optional']),
      currentCount: z.number().int(),
      targetMin: z.number().int(),
      targetMax: z.number().int(),
      status: z.enum(['under', 'optimal', 'over', 'missing']),
    }),
  ),
});
export type ContentScoreBreakdown = z.infer<typeof contentScoreBreakdownSchema>;

// ═════════════════════════════════════════════════════════════════════
// BullMQ job payloads — one schema per queue
// ═════════════════════════════════════════════════════════════════════

export const rankScanJobSchema = gridScanRequestSchema.extend({
  scheduledByUserId: cuidSchema.optional(),
});
export type RankScanJob = z.infer<typeof rankScanJobSchema>;

export const crawlJobSchema = z.object({
  campaignId: cuidSchema,
  sitemapUrl: urlSchema,
  crawlSessionId: cuidSchema,
  maxConcurrency: z.number().int().min(1).max(20).default(5),
  delayMs: z.number().int().min(0).default(500),
});
export type CrawlJob = z.infer<typeof crawlJobSchema>;

export const reportGenJobSchema = z.object({
  campaignId: cuidSchema,
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  templateId: cuidSchema.optional(),
});
export type ReportGenJob = z.infer<typeof reportGenJobSchema>;

export const socialPostJobSchema = z.object({
  scheduledPostId: cuidSchema,
  campaignId: cuidSchema,
});
export type SocialPostJob = z.infer<typeof socialPostJobSchema>;

export const emailSendJobSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  campaignId: cuidSchema.optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        r2Key: z.string(),
      }),
    )
    .optional(),
});
export type EmailSendJob = z.infer<typeof emailSendJobSchema>;

export const agentTaskJobSchema = z.object({
  campaignId: cuidSchema,
  module: z.nativeEnum(ModuleType),
  taskType: z.nativeEnum(AgentTaskType),
  taskDescription: z.string().min(1),
  targetEntityId: z.string().optional(),
  targetEntityType: z.string().optional(),
});
export type AgentTaskJob = z.infer<typeof agentTaskJobSchema>;

export const citationCheckJobSchema = z.object({
  campaignId: cuidSchema,
  directoryNames: z.array(z.string()).optional(),
});
export type CitationCheckJob = z.infer<typeof citationCheckJobSchema>;

export const gbpSyncJobSchema = z.object({
  campaignId: cuidSchema,
  // Full sync vs incremental
  mode: z.enum(['full', 'incremental']).default('incremental'),
});
export type GbpSyncJob = z.infer<typeof gbpSyncJobSchema>;

// ═════════════════════════════════════════════════════════════════════
// Pagination
// ═════════════════════════════════════════════════════════════════════

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof paginationSchema>;

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
