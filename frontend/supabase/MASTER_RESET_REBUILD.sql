-- ============================================================================
-- Tatrix360 — MASTER RESET + REBUILD (single source of truth, new architecture)
-- ============================================================================
-- Wipes EVERYTHING in public and rebuilds the exact schema the current
-- codebase needs:
--   * NEW ARCHITECTURE: main_categories, category_sections, articles,
--     top_articles (+ 7 hub seeds + starter sections)
--   * LEGACY SHELLS (kept empty for old-code fallbacks: homepage hero,
--     /category/*, /tag/*, /latest, search, sitemap): categories, authors,
--     tags, subcategories, posts, post_tags, post_categories
--   * SUPPORTING: newsletter_subscribers, contact_submissions, rate_limits
--
-- HOW TO USE
--   1. Supabase Dashboard -> SQL Editor -> paste this ENTIRE file -> Run.
--   2. Verify: SELECT slug FROM main_categories; (expect 7 rows)
--             SELECT count(*) FROM category_sections; (expect 19 rows)
--   3. npm run build
--
-- SAFE TO RE-RUN: yes (DROP SCHEMA makes it fresh every time).
--
-- WARNING: this deletes ALL existing rows (old posts included). If you want
-- the old content back afterwards, restore frontend/supabase/BACKUP_DATA.sql
-- AFTER running this file.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. TRUE WIPE — drop the whole public schema, then recreate it clean.
-- ---------------------------------------------------------------------------
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- anon/authenticated need USAGE on the schema itself or every query 401s.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- Extensions live in public and were dropped with it — re-create.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. NEW ARCHITECTURE TABLES (exact spec)
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
-- 2. LEGACY SHELLS (empty — old-code fallback paths only)
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE authors (
  id     SERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  slug   TEXT NOT NULL UNIQUE,
  bio    TEXT,
  avatar TEXT,
  role   TEXT
);

CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE subcategories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  subtitle         TEXT,
  content          TEXT,
  category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id   INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
  author_id        INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  hero_image       TEXT,
  post_type        TEXT DEFAULT 'News',
  seo_title        TEXT,
  seo_description  TEXT,
  featured         BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'Published',
  views            INTEGER NOT NULL DEFAULT 0,
  read_also_ids    INTEGER[] DEFAULT NULL,
  published_at     TIMESTAMPTZ DEFAULT now(),
  -- Compatibility columns so BACKUP_DATA.sql restores cleanly:
  section_id       INTEGER,
  is_roundup       BOOLEAN NOT NULL DEFAULT false,
  likes            INTEGER NOT NULL DEFAULT 0,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  tech_specs       JSONB NOT NULL DEFAULT '{}',
  embed_url        TEXT,
  hero_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_categories (
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ---------------------------------------------------------------------------
-- 3. SUPPORTING TABLES
-- ---------------------------------------------------------------------------

-- Newsletter subscribers — INSERT is public, reads are service-role only
CREATE TABLE newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact submissions — INSERT is public, reads are service-role only
CREATE TABLE contact_submissions (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting (lib/rate-limit.ts) — service_role only, no anon policies
CREATE TABLE rate_limits (
  id           BIGSERIAL PRIMARY KEY,
  route        TEXT NOT NULL,
  identifier   TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sections_main_category ON category_sections (main_category_id);
CREATE INDEX IF NOT EXISTS idx_sections_sort ON category_sections (main_category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_main_category ON articles (main_category_id);
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles (section_id);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_top_articles_sort ON top_articles (sort_order);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts (category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts (views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_subcategory_id ON posts (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_posts_read_also ON posts USING gin (read_also_ids);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors (slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags (slug);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags (post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories (is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories (slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_rate_limits_route_identifier_window ON rate_limits (route, identifier, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- 5. RLS + POLICIES (public reads where the site needs them; writes go
--    through service_role in the password-protected admin API routes)
-- ---------------------------------------------------------------------------
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_main_categories" ON main_categories;
CREATE POLICY "anon_select_main_categories" ON main_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_category_sections" ON category_sections;
CREATE POLICY "anon_select_category_sections" ON category_sections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_top_articles" ON top_articles;
CREATE POLICY "anon_select_top_articles" ON top_articles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_subcategories" ON subcategories;
CREATE POLICY "anon_select_subcategories" ON subcategories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_post_tags" ON post_tags;
CREATE POLICY "anon_select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_post_categories" ON post_categories;
CREATE POLICY "anon_select_post_categories" ON post_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- rate_limits: no anon policies (service_role only)

-- ---------------------------------------------------------------------------
-- 6. GRANTS (RLS policies filter rows — they DO NOT grant privileges.
--    Missing GRANTs caused the old `permission denied` build failures.)
-- ---------------------------------------------------------------------------
GRANT SELECT ON
  main_categories, category_sections, articles, top_articles,
  categories, authors, tags, subcategories, posts, post_tags, post_categories
  TO anon, authenticated;
GRANT INSERT ON newsletter_subscribers, contact_submissions TO anon, authenticated;
GRANT ALL ON
  main_categories, category_sections, articles, top_articles,
  categories, authors, tags, subcategories, posts, post_tags, post_categories,
  newsletter_subscribers, contact_submissions, rate_limits
  TO service_role;

DO $$
DECLARE
  s TEXT;
BEGIN
  FOR s IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO anon, authenticated, service_role;', s);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 7. SEEDS — 7 main hub categories + starter sections
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

-- Starter sections (visible, sort-ordered). Edit/extend in /adminmja/sections.
INSERT INTO category_sections (main_category_id, title, slug, sort_order) VALUES
  ((SELECT id FROM main_categories WHERE slug='os-news'), 'Windows', 'windows', 0),
  ((SELECT id FROM main_categories WHERE slug='os-news'), 'macOS', 'macos', 1),
  ((SELECT id FROM main_categories WHERE slug='os-news'), 'Linux', 'linux', 2),
  ((SELECT id FROM main_categories WHERE slug='os-news'), 'Android', 'android', 3),
  ((SELECT id FROM main_categories WHERE slug='os-news'), 'iOS', 'ios', 4),
  ((SELECT id FROM main_categories WHERE slug='ai-news'), 'Model Launches', 'model-launches', 0),
  ((SELECT id FROM main_categories WHERE slug='ai-news'), 'AI Tools', 'ai-tools', 1),
  ((SELECT id FROM main_categories WHERE slug='ai-news'), 'Research Papers', 'research-papers', 2),
  ((SELECT id FROM main_categories WHERE slug='app-updates'), 'Productivity', 'productivity', 0),
  ((SELECT id FROM main_categories WHERE slug='app-updates'), 'Gaming', 'gaming', 1),
  ((SELECT id FROM main_categories WHERE slug='app-updates'), 'Social', 'social', 2),
  ((SELECT id FROM main_categories WHERE slug='mobile'), 'Best Mobiles', 'best-mobiles', 0),
  ((SELECT id FROM main_categories WHERE slug='mobile'), 'Upcoming Mobile', 'upcoming-mobile', 1),
  ((SELECT id FROM main_categories WHERE slug='mobile'), 'Latest Mobile', 'latest-mobile', 2),
  ((SELECT id FROM main_categories WHERE slug='laptop'), 'Best Laptops', 'best-laptops', 0),
  ((SELECT id FROM main_categories WHERE slug='laptop'), 'Upcoming Laptop', 'upcoming-laptop', 1),
  ((SELECT id FROM main_categories WHERE slug='gadgets'), 'Reviews', 'reviews', 0),
  ((SELECT id FROM main_categories WHERE slug='gadgets'), 'Hands-On', 'hands-on', 1),
  ((SELECT id FROM main_categories WHERE slug='do-you-know'), 'Explainers', 'explainers', 0)
ON CONFLICT (main_category_id, slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- DONE. Next: publish articles from /adminmja/posts/new, pin homepage
-- picks in /adminmja/top-articles, then npm run build.
-- ---------------------------------------------------------------------------
