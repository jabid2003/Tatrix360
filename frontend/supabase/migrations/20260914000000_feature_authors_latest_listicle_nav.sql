-- ============================================================================
-- Tatrix360 — Feature pack: authors, latest/pinned, listicles, nav, settings
-- Migration: 20260914000000
-- Run in Supabase Dashboard -> SQL Editor. Safe to re-run (IF NOT EXISTS / DO).
-- Preserves existing data. Adds columns/tables/indexes/RLS + seeds nav order.
-- Covers BOTH content stacks:
--   legacy: posts (INT) + categories + authors
--   new:    articles (UUID) + main_categories
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- 1. AUTHORS — extend (keep `avatar` for back-compat, add `avatar_url` alias)
-- ---------------------------------------------------------------------------
ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE authors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill avatar_url from legacy avatar where empty
UPDATE authors SET avatar_url = avatar WHERE avatar_url IS NULL AND avatar IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_authors_is_active ON authors (is_active);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors (slug);
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors (name);

-- ---------------------------------------------------------------------------
-- 2. LEGACY CATEGORIES — nav controls
-- ---------------------------------------------------------------------------
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill display_order from sort_order where display_order is still 0
UPDATE categories SET display_order = sort_order WHERE display_order = 0 AND sort_order <> 0;

CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories (display_order);
CREATE INDEX IF NOT EXISTS idx_categories_show_nav ON categories (show_in_navbar) WHERE show_in_navbar = true;
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories (is_active);

-- ---------------------------------------------------------------------------
-- 3. MAIN_CATEGORIES (new arch) — nav controls + description
-- ---------------------------------------------------------------------------
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE main_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Required navbar order: OS News, AI News, App Updates, Mobile, Laptop, Gadgets, Do You Know?
-- (Home is a static "/" link rendered before these DB-driven items.)
UPDATE main_categories SET display_order = 0, description = COALESCE(description, 'Operating system news, updates and explainers.') WHERE slug = 'os-news';
UPDATE main_categories SET display_order = 1, description = COALESCE(description, 'Artificial intelligence news, tools and explainers.') WHERE slug = 'ai-news';
UPDATE main_categories SET display_order = 2, description = COALESCE(description, 'App updates, releases and platform moves.') WHERE slug = 'app-updates';
UPDATE main_categories SET display_order = 3, description = COALESCE(description, 'Phones, comparisons and buying guides.') WHERE slug = 'mobile';
UPDATE main_categories SET display_order = 4, description = COALESCE(description, 'Laptops, reviews and buying guides.') WHERE slug = 'laptop';
UPDATE main_categories SET display_order = 5, description = COALESCE(description, 'Hardware reviews and hands-on impressions.') WHERE slug = 'gadgets';
UPDATE main_categories SET display_order = 6, description = COALESCE(description, 'Explain the unknown — bite-size tech explainers.') WHERE slug = 'do-you-know';

-- Ensure the 7 hubs exist (idempotent) then force them visible/active
INSERT INTO main_categories (slug, display_name, display_order, show_in_navbar, is_active) VALUES
  ('os-news', 'OS News', 0, true, true),
  ('ai-news', 'AI News', 1, true, true),
  ('app-updates', 'App Updates', 2, true, true),
  ('mobile', 'Mobile', 3, true, true),
  ('laptop', 'Laptop', 4, true, true),
  ('gadgets', 'Gadgets', 5, true, true),
  ('do-you-know', 'Do You Know?', 6, true, true)
ON CONFLICT (slug) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  show_in_navbar = true,
  is_active = true;

CREATE INDEX IF NOT EXISTS idx_main_categories_order ON main_categories (display_order);
CREATE INDEX IF NOT EXISTS idx_main_categories_nav ON main_categories (show_in_navbar, is_active, display_order);

-- ---------------------------------------------------------------------------
-- 4. POSTS (legacy INT) — latest/pinned/visibility/listicle
-- ---------------------------------------------------------------------------
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_latest BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS latest_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS article_type TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS intro_content TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS conclusion_content TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Constrain article_type (drop if exists first for re-runnability)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_article_type_check') THEN
    ALTER TABLE posts ADD CONSTRAINT posts_article_type_check CHECK (article_type IN ('standard', 'listicle'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_is_visible ON posts (is_visible);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_latest ON posts (is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts (is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_posts_latest_sort ON posts (is_latest, latest_order, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned_sort ON posts (is_pinned, pinned_order, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts (category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_article_type ON posts (article_type);

-- ---------------------------------------------------------------------------
-- 5. ARTICLES (new UUID) — mirror same feature set + author + SEO + status
-- ---------------------------------------------------------------------------
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Published';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_latest BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS latest_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS pinned_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS article_type TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS intro_content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS conclusion_content TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_article_type_check') THEN
    ALTER TABLE articles ADD CONSTRAINT articles_article_type_check CHECK (article_type IN ('standard', 'listicle'));
  END IF;
END $$;

-- Backfill published_at from created_at where it equals the new default (keeps old rows sensible)
UPDATE articles SET published_at = created_at WHERE published_at IS NOT NULL AND created_at IS NOT NULL AND ABS(EXTRACT(EPOCH FROM (published_at - created_at))) < 2;

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_is_visible ON articles (is_visible);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_latest ON articles (is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_pinned ON articles (is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_articles_latest_sort ON articles (is_latest, latest_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_pinned_sort ON articles (is_pinned, pinned_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles (author_id);
CREATE INDEX IF NOT EXISTS idx_articles_article_type ON articles (article_type);
CREATE INDEX IF NOT EXISTS idx_articles_main_category ON articles (main_category_id);

-- ---------------------------------------------------------------------------
-- 6. LIST ITEM TABLES — one per parent PK type (FK integrity)
--    article_items -> articles (UUID)  [required by spec]
--    post_items    -> posts (INT)      [mirror so legacy feed also supports listicles]
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_items (
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

CREATE TABLE IF NOT EXISTS post_items (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT,
  description TEXT,
  image_url TEXT,
  image_alt TEXT,
  brand TEXT,
  price_text TEXT,
  product_url TEXT,
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
  UNIQUE (post_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_article_items_article ON article_items (article_id, display_order);
CREATE INDEX IF NOT EXISTS idx_article_items_visible ON article_items (article_id, is_visible, display_order);
CREATE INDEX IF NOT EXISTS idx_post_items_post ON post_items (post_id, display_order);
CREATE INDEX IF NOT EXISTS idx_post_items_visible ON post_items (post_id, is_visible, display_order);

-- ---------------------------------------------------------------------------
-- 7. SITE SETTINGS — single-row config for footer/brand/social
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Tatrix360',
  logo_url TEXT,
  description TEXT NOT NULL DEFAULT 'Sharp, independent tech reporting on AI, systems, devices, and the apps that shape our digital lives.',
  copyright_text TEXT,
  social_twitter TEXT,
  social_github TEXT,
  social_youtube TEXT,
  social_instagram TEXT,
  show_newsletter BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, site_name) VALUES (1, 'Tatrix360')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. RLS — public reads restricted to published/visible; writes via service_role
-- ---------------------------------------------------------------------------
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive write policies (hardening already did most; be exhaustive)
DROP POLICY IF EXISTS "anon_insert_authors" ON authors;
DROP POLICY IF EXISTS "anon_update_authors" ON authors;
DROP POLICY IF EXISTS "anon_delete_authors" ON authors;
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;

-- Public SELECT policies (replace permissive USING(true) where present)
DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "public_read_active_authors" ON authors
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "public_read_active_categories" ON categories
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "anon_select_main_categories" ON main_categories;
CREATE POLICY "public_read_active_main_categories" ON main_categories
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "public_read_published_posts" ON posts
  FOR SELECT TO anon, authenticated
  USING (status = 'Published' AND is_visible = true);

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "public_read_published_articles" ON articles
  FOR SELECT TO anon, authenticated
  USING (status = 'Published' AND is_visible = true);

DROP POLICY IF EXISTS "public_read_article_items" ON article_items;
CREATE POLICY "public_read_article_items" ON article_items
  FOR SELECT TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "public_read_post_items" ON post_items;
CREATE POLICY "public_read_post_items" ON post_items
  FOR SELECT TO anon, authenticated USING (is_visible = true);

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 9. GRANTS (RLS filters rows; GRANTs give privileges)
--    Note: some relations are created by other migrations / ad-hoc (e.g.
--    category_sections, top_articles, menu_items) and may not exist here —
--    grant them only if they exist so re-running never errors.
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE tbl_name TEXT;
  rels TEXT[] := ARRAY[
    'authors', 'categories', 'main_categories', 'category_sections', 'articles',
    'posts', 'article_items', 'post_items', 'site_settings', 'top_articles',
    'tags', 'post_tags', 'post_categories', 'subcategories', 'menu_items',
    'navbar_links'
  ];
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

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
