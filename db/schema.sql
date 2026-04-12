-- Run: psql $DATABASE_URL -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS crawl_seeds (
  id              SERIAL PRIMARY KEY,
  keyword         TEXT NOT NULL,
  platform        TEXT NOT NULL,  -- 'youtube'|'reddit'|'bilibili'|'twitch'
  category        TEXT,
  last_crawled_at TIMESTAMPTZ,
  UNIQUE(keyword, platform)
);

CREATE TABLE IF NOT EXISTS kol_cache (
  id               SERIAL PRIMARY KEY,
  platform         TEXT NOT NULL,  -- 'youtube'|'reddit'|'bilibili'|'twitch'
  keyword          TEXT NOT NULL,
  channel_id       TEXT,
  channel_name     TEXT NOT NULL,
  subscriber_count BIGINT,
  description      TEXT,
  recent_titles    TEXT[],
  channel_url      TEXT NOT NULL,
  embedding        vector(1536),
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_kol_embedding
  ON kol_cache USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_kol_platform_subs
  ON kol_cache (platform, subscriber_count);

CREATE INDEX IF NOT EXISTS idx_kol_fetched
  ON kol_cache (fetched_at);

-- Sample seeds — insert your own keywords here
-- INSERT INTO crawl_seeds (keyword, platform, category) VALUES
--   ('metroidvania', 'youtube', 'genre'),
--   ('indie roguelike', 'youtube', 'genre'),
--   ('cozy farming game', 'youtube', 'genre'),
--   ('roguelikes', 'reddit', 'community'),
--   ('indiegaming', 'reddit', 'community'),
--   ('银河恶魔城', 'bilibili', 'genre'),
--   ('独立游戏', 'bilibili', 'general'),
--   ('indie game', 'twitch', 'genre');
