-- ─────────────────────────────────────────────────────────────────────
-- RDP — Database Extensions
-- Runs automatically on first container start (Postgres init scripts).
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────

-- UUID generation (some libraries expect this present)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS — geographic types for geo-grid distance math
CREATE EXTENSION IF NOT EXISTS postgis;

-- TimescaleDB — hypertables for GridScan rank history.
-- Already loaded as a shared_preload_library in this image; CREATE EXTENSION
-- registers it on this database.
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- pgvector — embeddings for KnowledgeGraphNode + KnowledgeDoc semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- pg_trgm — fuzzy text matching (useful for citation NAP comparisons later)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
