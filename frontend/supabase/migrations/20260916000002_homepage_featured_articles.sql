-- ============================================================================
-- Tatrix360 — Homepage Featured Articles per Category
-- Migration: 20260916000002_homepage_featured_articles
-- Lets admin curate which articles appear on the homepage, grouped by category.
-- ============================================================================

CREATE TABLE IF NOT EXISTS homepage_featured (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug TEXT NOT NULL,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_slug, article_id)
);

CREATE INDEX IF NOT EXISTS idx_homepage_featured_category ON homepage_featured (category_slug, sort_order);

-- RLS
ALTER TABLE homepage_featured ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_homepage_featured" ON homepage_featured;
CREATE POLICY "public_read_homepage_featured" ON homepage_featured
  FOR SELECT TO anon, authenticated USING (is_visible = true);

-- Grants
GRANT SELECT ON homepage_featured TO anon, authenticated;
GRANT ALL ON homepage_featured TO service_role;
