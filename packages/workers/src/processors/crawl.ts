/**
 * Crawl processor — Playwright sitemap crawler.
 *
 * Phase 1: stub. Phase 4 brings Playwright + Cheerio + robots.txt
 * compliance + dual-bot crawl mode (skill-technical-seo-crawler.md).
 */
import { createWorker } from '../base-worker';
import { crawlJobSchema } from '@rdp/types';
import { QUEUE_NAMES } from '../queues';

export const crawlWorker = createWorker({
  name: QUEUE_NAMES.CRAWL,
  schema: crawlJobSchema,
  concurrency: 1, // Crawls are heavy; serialize at worker level
  handler: async (payload, { logger }) => {
    logger.info(
      { campaignId: payload.campaignId, sitemapUrl: payload.sitemapUrl },
      '[stub] crawl invoked — Phase 4 will implement',
    );
    return { stub: true, crawlSessionId: payload.crawlSessionId };
  },
});
