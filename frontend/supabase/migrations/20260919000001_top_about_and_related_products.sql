-- ============================================================================
-- Tatrix360 — Top list about text + article related products
-- Migration: 20260919000001
-- Run in Supabase Dashboard -> SQL Editor. Safe to re-run (IF NOT EXISTS).
-- 1. articles.related_product_ids (array of product UUIDs) so an article can
--    embed "Related products" cards grouped by category.
-- 2. top_list_meta (one row per top-picks category) holding the admin-written
--    "About this Top list" text shown on /top/* pages.
-- ============================================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_product_ids UUID[] DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_related_products ON articles USING gin (related_product_ids);

CREATE TABLE IF NOT EXISTS top_list_meta (
  category TEXT PRIMARY KEY CHECK (category IN ('mobile','laptop','gadget')),
  about TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- RLS / grants (mirrors the pattern in migration 20260915000000)
-- ---------------------------------------------------------------------------
ALTER TABLE top_list_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_top_list_meta" ON top_list_meta;
CREATE POLICY "public_read_top_list_meta" ON top_list_meta
  FOR SELECT TO anon, authenticated USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE tbl_name TEXT;
  rels TEXT[] := ARRAY['articles', 'top_list_meta'];
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
