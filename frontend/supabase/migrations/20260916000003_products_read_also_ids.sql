-- ============================================================================
-- Tatrix360 — Read Also links for products (specs)
-- Migration: 20260916000003_products_read_also_ids
-- Adds read_also_ids (array of article UUIDs) so a product spec page can
-- link to related articles in a "Read Also" section.
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS read_also_ids UUID[] DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_products_read_also ON products USING gin (read_also_ids);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE tbl_name TEXT;
  rels TEXT[] := ARRAY['products'];
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
