/**
 * @rdp/nlp — NLP primitives for content optimization.
 *
 * Phase 1: language detection only — enough to route content to
 * the right tokenizer downstream. Phase 5 brings the full TF-IDF
 * engine, 5-dimension content scorer, and entity extractor.
 */
import { franc } from 'franc';

/**
 * Detect language from a content sample.
 *
 * Returns 'en-CA' or 'fr-CA' (we never serve other languages from RDP);
 * defaults to 'en-CA' when input is too short to be confident.
 *
 * Note: franc returns ISO 639-3 codes ('eng', 'fra', 'und'). We
 * collapse to our two supported tags.
 */
export function detectLanguage(text: string): 'en-CA' | 'fr-CA' {
  if (text.length < 30) return 'en-CA';
  const code = franc(text, { minLength: 30, only: ['eng', 'fra'] });
  return code === 'fra' ? 'fr-CA' : 'en-CA';
}

/**
 * Strip HTML tags from raw page content. Cheap pre-tokenization step.
 * Real crawler pipeline (Phase 4) uses Cheerio for full extraction.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Placeholders for Phase 5 — typed exports so consumers can already
// reference them without breaking imports.
export interface TfidfTerm {
  term: string;
  tfidfScore: number;
  documentFrequency: number;
  priority: 'required' | 'recommended' | 'optional';
}

export interface ExtractedEntity {
  text: string;
  type: 'PERSON' | 'PLACE' | 'ORGANIZATION' | 'PRODUCT' | 'EVENT' | 'DATE' | 'OTHER';
  count: number;
  salience: number;
}
