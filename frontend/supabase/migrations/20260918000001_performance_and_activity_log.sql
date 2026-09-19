-- ============================================================================
-- Tatrix360 — Performance indexes + admin activity log (P3, A4)
-- Migration: 20260918000001_performance_and_activity_log
-- Defensive: every index is created only if its table exists, so this
-- migration runs clean even when optional feature migrations were skipped.
-- ============================================================================

-- Admin activity log: append-only audit trail of admin mutations.
-- Single-admin setup, so no user FK — action + entity + timestamp.
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created
  ON admin_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity
  ON admin_activity_log (entity_type, entity_id);

-- RLS: deny everyone by default; service_role bypasses RLS for admin writes.
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Frequently-filtered columns (P3): avoid sequential scans as tables grow.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);
    CREATE INDEX IF NOT EXISTS idx_articles_main_category ON articles (main_category_id);
    CREATE INDEX IF NOT EXISTS idx_articles_section ON articles (section_id);
    CREATE INDEX IF NOT EXISTS idx_articles_is_visible ON articles (is_visible);
    CREATE INDEX IF NOT EXISTS idx_articles_is_latest ON articles (is_latest);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_article_type ON articles (article_type);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE INDEX IF NOT EXISTS idx_products_category_status ON products (category, status);
    CREATE INDEX IF NOT EXISTS idx_products_is_visible ON products (is_visible);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'article_items') THEN
    CREATE INDEX IF NOT EXISTS idx_article_items_article ON article_items (article_id, display_order);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_featured') THEN
    CREATE INDEX IF NOT EXISTS idx_homepage_featured_category ON homepage_featured (category_slug, sort_order);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'top_articles') THEN
    CREATE INDEX IF NOT EXISTS idx_top_articles_order ON top_articles (sort_order);
  END IF;
END
$$;
