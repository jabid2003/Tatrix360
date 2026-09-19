-- ============================================================================
-- Tatrix360 — NEW ARCHITECTURE RESET (section system, no sub-categories)
-- ============================================================================
-- HOW TO USE
--   1. Paste this ENTIRE file into Supabase Dashboard -> SQL Editor -> Run.
--   2. Verify: SELECT slug FROM main_categories; (expect 7 rows)
--   3. npm run build
--
-- SAFE TO RE-RUN: yes (DROP ... IF EXISTS guards).
--
-- NOTES
--   * Only the 4 new tables are dropped/rebuilt. Legacy tables (posts,
--     categories, subcategories, ...) are left untouched so old content
--     stays readable until you migrate it into `articles`.
--   * RLS is enabled with public SELECT policies + explicit GRANTs, because
--     RLS policies alone do NOT grant privileges (that caused the
--     `permission denied for table post_tags` build failure before).
-- ============================================================================

-- Extensions (uuid generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 0. DROP existing new-arch tables (if any) — order matters (FK deps)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS top_articles CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS category_sections CASCADE;
DROP TABLE IF EXISTS main_categories CASCADE;

-- ---------------------------------------------------------------------------
-- 1. TABLES (exact spec)
-- ---------------------------------------------------------------------------

CREATE TABLE main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE category_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  UNIQUE (main_category_id, slug)
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE RESTRICT,
  section_id UUID REFERENCES category_sections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE top_articles (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- 2. INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sections_main_category ON category_sections (main_category_id);
CREATE INDEX IF NOT EXISTS idx_sections_sort ON category_sections (main_category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_main_category ON articles (main_category_id);
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles (section_id);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_top_articles_sort ON top_articles (sort_order);

-- ---------------------------------------------------------------------------
-- 3. RLS + POLICIES (public reads; writes via service_role from admin APIs)
-- ---------------------------------------------------------------------------
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_main_categories" ON main_categories;
CREATE POLICY "anon_select_main_categories" ON main_categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_category_sections" ON category_sections;
CREATE POLICY "anon_select_category_sections" ON category_sections
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_top_articles" ON top_articles;
CREATE POLICY "anon_select_top_articles" ON top_articles
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 4. GRANTS (RLS policies filter rows — they DO NOT grant privileges)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON main_categories, category_sections, articles, top_articles TO anon, authenticated;
GRANT ALL ON main_categories, category_sections, articles, top_articles TO service_role;

-- ---------------------------------------------------------------------------
-- 5. SEEDS — 7 main hub categories
-- ---------------------------------------------------------------------------
INSERT INTO main_categories (slug, display_name) VALUES
  ('os-news', 'OS News'),
  ('ai-news', 'AI News'),
  ('app-updates', 'App Updates'),
  ('mobile', 'Mobile'),
  ('laptop', 'Laptop'),
  ('gadgets', 'Gadgets'),
  ('do-you-know', 'Do You Know?')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- DONE. Sections + articles are created from the admin panel:
--   /adminmja/sections  (section config engine)
--   /adminmja/posts/new (article publisher, cascading selects)
-- ---------------------------------------------------------------------------
