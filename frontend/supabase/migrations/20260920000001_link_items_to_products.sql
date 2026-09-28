-- ============================================================================
-- Tatrix360 — Link listicle items to spec products
-- Migration: 20260920000001
-- Run in Supabase Dashboard -> SQL Editor. Safe to re-run.
-- Adds article_items.product_id so a listicle item can reference a product
-- from the specs catalog (mobile/laptop/gadget). The same product can be
-- linked from unlimited articles. ON DELETE SET NULL: deleting a product
-- unlinks the item instead of deleting the article content.
--
-- NOTE: if migration 20260914000000 was never run, article_items won't
-- exist — this file creates the full table in that case (with product_id
-- included) so listicles work end to end.
-- ============================================================================

DO $$
BEGIN
  -- 1. Ensure the table exists (full schema from 20260914000000 + product_id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'article_items'
  ) THEN
    CREATE TABLE public.article_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT,
      summary TEXT,
      description TEXT,
      image_url TEXT,
      image_alt TEXT,
      brand TEXT,
      price_text TEXT,
      product_url TEXT,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      badge TEXT,
      release_date DATE,
      rating NUMERIC(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
      pros TEXT[] NOT NULL DEFAULT '{}',
      cons TEXT[] NOT NULL DEFAULT '{}',
      specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (article_id, slug)
    );
    ALTER TABLE public.article_items ENABLE ROW LEVEL SECURITY;
  ELSE
    -- 2. Table exists: just add the link column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'article_items'
        AND column_name = 'product_id'
    ) THEN
      ALTER TABLE public.article_items
        ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_article_items_article ON article_items (article_id, display_order);
CREATE INDEX IF NOT EXISTS idx_article_items_visible ON article_items (article_id, is_visible, display_order);
CREATE INDEX IF NOT EXISTS idx_article_items_product ON article_items (product_id);

-- Public read for visible items (mirrors other content tables; harmless if
-- a policy already exists — DROP first for re-runnability).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'article_items'
  ) THEN
    DROP POLICY IF EXISTS "public_read_article_items" ON public.article_items;
    CREATE POLICY "public_read_article_items" ON public.article_items
      FOR SELECT TO anon, authenticated USING (is_visible = true);
    GRANT SELECT ON public.article_items TO anon, authenticated;
    GRANT ALL ON public.article_items TO service_role;
  END IF;
END
$$;
