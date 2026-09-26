-- ============================================================================
-- Tatrix360 — Link listicle items to spec products
-- Migration: 20260920000001
-- Run in Supabase Dashboard -> SQL Editor. Safe to re-run (IF NOT EXISTS).
-- Adds article_items.product_id so a listicle item can reference a product
-- from the specs catalog (mobile/laptop/gadget). The same product can be
-- linked from unlimited articles (e.g. "Best phones under 20000" AND
-- "Top 5 camera phones"). ON DELETE SET NULL: deleting a product unlinks
-- the item instead of deleting the article content.
-- ============================================================================

ALTER TABLE article_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_article_items_product ON article_items (product_id);
