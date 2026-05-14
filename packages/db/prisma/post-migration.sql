-- ─────────────────────────────────────────────────────────────────────
-- RDP — Post-Migration SQL
-- Run AFTER `pnpm prisma migrate dev --name init`.
-- Prisma can't express these constructs natively, so they live here.
-- ─────────────────────────────────────────────────────────────────────
--
-- Usage:
--   docker compose exec postgres \
--     psql -U rdp -d rdp_dev -f /docker-entrypoint-initdb.d/post-migration.sql
-- Or from host:
--   docker compose exec -T postgres psql -U rdp rdp_dev < packages/db/prisma/post-migration.sql
--
-- All operations are idempotent. Safe to re-run.

-- ─────────────────────────────────────────────────────────────────────
-- 1. TimescaleDB: GridScan as hypertable
-- Partitioned on scannedAt for efficient time-range queries on rank history.
-- ─────────────────────────────────────────────────────────────────────
SELECT create_hypertable(
  '"GridScan"',
  'scannedAt',
  if_not_exists => TRUE,
  migrate_data => TRUE
);

-- Optional retention policy: drop scan chunks older than 2 years (PRD §19)
-- Uncomment when ready:
-- SELECT add_retention_policy('"GridScan"', INTERVAL '2 years', if_not_exists => TRUE);

-- ─────────────────────────────────────────────────────────────────────
-- 2. pgvector indexes
-- HNSW: good for moderate datasets, no need to "train" before use.
-- Use vector_cosine_ops because our retrieval uses cosine distance (<=>).
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_kg_node_embedding_hnsw
  ON "KnowledgeGraphNode"
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_doc_chunk_embedding_hnsw
  ON "KnowledgeDocChunk"
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crawled_url_content_embedding_hnsw
  ON "CrawledUrl"
  USING hnsw ("contentEmbedding" vector_cosine_ops)
  WHERE "contentEmbedding" IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Trigram indexes for fuzzy NAP matching (citations)
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_citation_directory_trgm
  ON "Citation"
  USING gin ("directoryName" gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────
-- 4. PostGIS geography column for ClientProfile (proximity queries)
-- We store lat/lng as Float in Prisma; add a generated geography for
-- distance queries via ST_DWithin / ST_Distance.
-- ─────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ClientProfile' AND column_name = 'center_geog'
  ) THEN
    ALTER TABLE "ClientProfile"
      ADD COLUMN center_geog geography(POINT, 4326)
      GENERATED ALWAYS AS (
        CASE
          WHEN "centerLat" IS NOT NULL AND "centerLng" IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint("centerLng", "centerLat"), 4326)::geography
          ELSE NULL
        END
      ) STORED;

    CREATE INDEX idx_client_profile_center_geog
      ON "ClientProfile"
      USING gist (center_geog);
  END IF;
END $$;
