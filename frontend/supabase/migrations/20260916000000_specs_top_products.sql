-- ============================================================================
-- Tatrix360 — Specs / Top Products system
-- Migration: 20260916000000
-- Adds products (Mobiles, Laptops, Gadgets) with custom spec sections +
-- top_picks collection + site_settings toggle for User Reviews.
-- Safe to re-run (IF NOT EXISTS / DO blocks).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. site_settings — global toggle to hide/show User Reviews section
-- ---------------------------------------------------------------------------
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_user_reviews BOOLEAN NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 2. products — dedicated specs database
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK (category IN ('mobile','laptop','gadget')),
  price_text TEXT,
  price_value NUMERIC,
  is_expected_price BOOLEAN NOT NULL DEFAULT false,
  launch_date_text TEXT,
  rating NUMERIC(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  rating_count_text TEXT,
  short_description TEXT,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  -- Specs as ordered JSON array of sections: [{title, icon, fields:[{label,value}]}]
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  special_features TEXT[] NOT NULL DEFAULT '{}',
  -- Key specs for Top page (compact 4-up): [{label,value,icon}]
  key_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft','Published','Archived')),
  show_user_reviews BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_is_visible ON products (is_visible);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. top_picks — curated Top 5 / Top 10 per category (Mobile, Laptop, Gadget)
--    Order defines rendering order on the Top page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS top_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('mobile','laptop','gadget')),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, product_id)
);

CREATE INDEX IF NOT EXISTS idx_top_picks_category_order ON top_picks (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_top_picks_product ON top_picks (product_id);

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_products" ON products;
CREATE POLICY "public_read_published_products" ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'Published' AND is_visible = true);

DROP POLICY IF EXISTS "public_read_top_picks" ON top_picks;
CREATE POLICY "public_read_top_picks" ON top_picks
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 5. GRANTS
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE tbl_name TEXT;
  rels TEXT[] := ARRAY['products','top_picks','site_settings'];
BEGIN
  FOREACH tbl_name IN ARRAY rels
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = tbl_name
        AND c.relkind IN ('r','v','m','p')
    ) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tbl_name);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl_name);
    END IF;
  END LOOP;
END $$;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
