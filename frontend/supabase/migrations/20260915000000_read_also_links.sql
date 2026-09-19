-- ============================================================================
-- Tatrix360 — Read Also links for new-architecture articles
-- Migration: 20260915000000
-- Run in Supabase Dashboard -> SQL Editor. Safe to re-run (IF NOT EXISTS).
-- Adds read_also_ids (array of article UUIDs) so an article can link to a
-- "Read also" list of plain-titled related articles with embedded links.
-- ============================================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_also_ids UUID[] DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_read_also ON articles USING gin (read_also_ids);

-- ---------------------------------------------------------------------------
-- RLS / grants for the new column (table may be re-created in some reset SQL,
-- so grant if it exists — mirrors the pattern in migration 20260914000000).
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE tbl_name TEXT;
  rels TEXT[] := ARRAY['articles'];
BEGIN
  FOREACH tbl_name IN ARRAY rels
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = tbl_name
        AND c.relkind IN ('r', 'v', 'm', 'p')
    ) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tbl_name);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl_name);
    END IF;
  END LOOP;
END $$;