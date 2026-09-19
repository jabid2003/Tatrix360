-- ============================================================================
-- Tatrix360  —  MASTER DATABASE RESET (single source of truth)
-- ============================================================================
-- Wipes EVERYTHING in public and rebuilds the exact schema the baseline code
-- needs (backend = Next.js App Router + Supabase).
--
-- HOW TO USE
--   1. OPTIONAL: first run supabase/BACKUP_DATA.sql (if you want your current
--      articles/categories back — either skip, or restore it AFTER this file).
--   2. Paste this ENTIRE file into Supabase Dashboard -> SQL Editor -> Run.
--   3. npm run build (static-gen schema cache errors will be gone).
--
-- SAFE TO RE-RUN: yes (DROP ... IF EXISTS guards + DROP SCHEMA makes it fresh).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. TRUE WIPE — drop the whole public schema, then recreate it clean.
-- ---------------------------------------------------------------------------
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- anon/authenticated need USAGE on the schema itself or every table query 401s.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- Extensions live in public and were dropped with it — re-create.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- Categories (single-tenant editorial taxonomy)
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

-- Authors
CREATE TABLE authors (
  id     SERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  slug   TEXT NOT NULL UNIQUE,
  bio    TEXT,
  avatar TEXT,
  role   TEXT
);
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT TO anon, authenticated USING (true);

-- Tags
CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);

-- Subcategories (two-tier nav under mobile / laptop / os / apps)
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
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subcategories" ON subcategories;
CREATE POLICY "anon_select_subcategories" ON subcategories FOR SELECT TO anon, authenticated USING (true);

-- Posts
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
  -- Compatibility columns (no longer used by baseline code, keep so old
  -- content dumps restore cleanly after this reset):
  section_id       INTEGER,
  is_roundup       BOOLEAN NOT NULL DEFAULT false,
  likes            INTEGER NOT NULL DEFAULT 0,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  tech_specs       JSONB NOT NULL DEFAULT '{}',
  embed_url        TEXT,
  hero_order       INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);

-- Post <-> Tag join
CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_post_tags" ON post_tags;
CREATE POLICY "anon_select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);

-- Post <-> Category join (multi-category)
CREATE TABLE post_categories (
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_post_categories" ON post_categories;
CREATE POLICY "anon_select_post_categories" ON post_categories FOR SELECT TO anon, authenticated USING (true);

-- Menu items (drives getMenu() primary/secondary bars)
CREATE TABLE menu_items (
  id         SERIAL PRIMARY KEY,
  label      TEXT NOT NULL,
  url        TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  section    TEXT NOT NULL DEFAULT 'primary'
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT TO anon, authenticated USING (true);

-- Newsletter subscribers — INSERT is public, reads are service-role only
CREATE TABLE newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Contact submissions — INSERT is public, reads are service-role only
CREATE TABLE contact_submissions (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Rate limiting (lib/rate-limit.ts) — service_role only, no anon policies
CREATE TABLE rate_limits (
  id           BIGSERIAL PRIMARY KEY,
  route        TEXT NOT NULL,
  identifier   TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Navbar links — fully dynamic mega-menu tree (drives components/site/navbar.tsx)
CREATE TABLE navbar_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label        text NOT NULL,
  slug         text NOT NULL,
  parent_id    uuid REFERENCES navbar_links(id) ON DELETE CASCADE,
  is_mega_menu boolean DEFAULT false,
  icon_name    text,
  description  text,
  order_index  int NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE navbar_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_navbar" ON navbar_links;
CREATE POLICY "anon_select_navbar" ON navbar_links FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 2. INDEXES
-- ---------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items (section);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories (is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories (slug);
CREATE INDEX IF NOT EXISTS idx_navbar_parent ON navbar_links (parent_id);
CREATE INDEX IF NOT EXISTS idx_navbar_order ON navbar_links (order_index);
CREATE INDEX IF NOT EXISTS idx_rate_limits_route_identifier_window ON rate_limits (route, identifier, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- 3. GRANTS  (RLS policies filter rows, they DO NOT grant privileges)
--    anon/authenticated => public reads; service_role => admin writes.
-- ---------------------------------------------------------------------------
GRANT SELECT ON categories, authors, tags, subcategories, posts, post_tags, post_categories, menu_items, navbar_links TO anon, authenticated;
GRANT INSERT ON newsletter_subscribers, contact_submissions TO anon, authenticated;
GRANT ALL ON categories, authors, tags, subcategories, posts, post_tags, post_categories, menu_items, navbar_links, newsletter_subscribers, contact_submissions, rate_limits TO service_role;

DO $$
DECLARE
  s TEXT;
BEGIN
  FOR s IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO anon, authenticated, service_role;', s);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. SEEDS — taxonomy + navigation
-- ---------------------------------------------------------------------------

-- Categories (9, no overlap)
INSERT INTO categories (name, slug, description, sort_order) VALUES
('AI', 'ai', 'Artificial intelligence news, tools & explainers', 1),
('News', 'news', 'Tech news & breaking stories', 2),
('Gadgets', 'gadgets', 'Hardware reviews & hands-on', 3),
('Do you know?', 'do-you-know', 'Explain the unknown', 4),
('Mobile', 'mobile', 'Phones, comparisons & buying guides', 5),
('Laptop', 'laptop', 'Laptops & buying guides', 6),
('OS', 'os', 'Operating systems', 7),
('Apps', 'apps', 'Apps & software', 8),
('How-To', 'how-to', 'Guides & tutorials', 9)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories (17)
INSERT INTO subcategories (name, slug, category_id, sort_order) VALUES
('Best Phones Under ₹10,000', 'best-phones-under-10000', (SELECT id FROM categories WHERE slug='mobile'), 0),
('Best Phones Under ₹20,000', 'best-phones-under-20000', (SELECT id FROM categories WHERE slug='mobile'), 1),
('Best Phones Under ₹30,000', 'best-phones-under-30000', (SELECT id FROM categories WHERE slug='mobile'), 2),
('Upcoming Phones in 2026', 'upcoming-phones-2026', (SELECT id FROM categories WHERE slug='mobile'), 3),
('Latest Mobile Phones', 'latest-mobile-phones', (SELECT id FROM categories WHERE slug='mobile'), 4),
('Upcoming Mobile', 'upcoming-mobile', (SELECT id FROM categories WHERE slug='mobile'), 5),
('Best Laptops Under ₹30,000', 'best-laptops-under-30000', (SELECT id FROM categories WHERE slug='laptop'), 0),
('Best Laptops Under ₹40,000', 'best-laptops-under-40000', (SELECT id FROM categories WHERE slug='laptop'), 1),
('Best Laptops Under ₹50,000', 'best-laptops-under-50000', (SELECT id FROM categories WHERE slug='laptop'), 2),
('Best Laptops Under ₹60,000', 'best-laptops-under-60000', (SELECT id FROM categories WHERE slug='laptop'), 3),
('Upcoming Laptop', 'upcoming-laptop', (SELECT id FROM categories WHERE slug='laptop'), 4),
('Android', 'android', (SELECT id FROM categories WHERE slug='os'), 0),
('iOS', 'ios', (SELECT id FROM categories WHERE slug='os'), 1),
('Windows', 'windows', (SELECT id FROM categories WHERE slug='os'), 2),
('macOS', 'macos', (SELECT id FROM categories WHERE slug='os'), 3),
('Productivity', 'productivity', (SELECT id FROM categories WHERE slug='apps'), 0),
('Gaming', 'gaming', (SELECT id FROM categories WHERE slug='apps'), 1),
('AI Tools', 'ai-tools', (SELECT id FROM categories WHERE slug='apps'), 2)
ON CONFLICT (slug) DO NOTHING;

-- Menu items (matches getMenu() PRIMARY_URLS exactly)
DELETE FROM menu_items;
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Home', '/', 0, 'primary'),
('AI', '/category/ai', 1, 'primary'),
('News', '/category/news', 2, 'primary'),
('Gadgets', '/category/gadgets', 3, 'primary'),
('Do you know?', '/category/do-you-know', 4, 'primary'),
('About', '/about', 5, 'primary'),
('Featured', '/latest', 0, 'secondary'),
('Mobile', '/category/mobile', 1, 'secondary'),
('Laptop', '/category/laptop', 2, 'secondary'),
('OS', '/category/os', 3, 'secondary'),
('Apps', '/category/apps', 4, 'secondary'),
('How-To', '/category/how-to', 5, 'secondary');

-- Navbar (fully recreated: 7 top-level + mega-menu children, incl. upcoming)
DELETE FROM navbar_links;
INSERT INTO navbar_links (label, slug, icon_name, order_index, is_mega_menu, description) VALUES
('Home', '/', 'Home', 0, false, 'Homepage'),
('AI News', '/category/ai-news', 'BrainCircuit', 1, true, 'Artificial intelligence updates, models, tools & research'),
('OS News', '/category/os-news', 'Layers', 2, true, 'Windows, macOS, Linux, Android & iOS updates'),
('Top Mobiles & Laptops', '/category/top-devices', 'Smartphone', 3, true, 'Hardware reviews, launches & specs'),
('Apps Update', '/category/apps-update', 'AppWindow', 4, true, 'Software patches, new features & app releases'),
('About', '/about', 'Info', 5, false, 'About Tatrix360'),
('Contact', '/contact', 'Mail', 6, false, 'Contact us');

INSERT INTO navbar_links (label, slug, parent_id, icon_name, order_index, description) VALUES
('Model Launches', '/category/ai-news/model-launches', (SELECT id FROM navbar_links WHERE slug='/category/ai-news'), 'Bot', 0, 'Big model releases & benchmarks'),
('AI Tools', '/category/ai-news/ai-tools', (SELECT id FROM navbar_links WHERE slug='/category/ai-news'), 'Sparkles', 1, 'Productivity & creative AI apps'),
('Research Papers', '/category/ai-news/research-papers', (SELECT id FROM navbar_links WHERE slug='/category/ai-news'), 'FileText', 2, 'New AI research explained'),
('Windows', '/category/os-news/windows', (SELECT id FROM navbar_links WHERE slug='/category/os-news'), 'Monitor', 0, 'Windows 11 & updates'),
('macOS', '/category/os-news/macos', (SELECT id FROM navbar_links WHERE slug='/category/os-news'), 'Apple', 1, 'macOS, Mac fixes & features'),
('Linux', '/category/os-news/linux', (SELECT id FROM navbar_links WHERE slug='/category/os-news'), 'Terminal', 2, 'Kernel, distros & tips'),
('Android', '/category/os-news/android', (SELECT id FROM navbar_links WHERE slug='/category/os-news'), 'Smartphone', 3, 'Android 15, One UI & apps'),
('iOS', '/category/os-news/ios', (SELECT id FROM navbar_links WHERE slug='/category/os-news'), 'Tablet', 4, 'iOS 18 & iPhone software'),
('Best Mobiles', '/category/top-devices/best-mobiles', (SELECT id FROM navbar_links WHERE slug='/category/top-devices'), 'Smartphone', 0, 'Phone launches, reviews & specs'),
('Best Laptops', '/category/top-devices/best-laptops', (SELECT id FROM navbar_links WHERE slug='/category/top-devices'), 'Laptop', 1, 'Laptop reviews & buying guides'),
('Upcoming Mobile', '/category/top-devices/upcoming-mobile', (SELECT id FROM navbar_links WHERE slug='/category/top-devices'), 'Smartphone', 2, 'Upcoming phones & launch dates'),
('Upcoming Laptop', '/category/top-devices/upcoming-laptop', (SELECT id FROM navbar_links WHERE slug='/category/top-devices'), 'Laptop', 3, 'Upcoming laptops & launch dates'),
('Productivity', '/category/apps-update/productivity', (SELECT id FROM navbar_links WHERE slug='/category/apps-update'), 'Briefcase', 0, 'Work & productivity apps'),
('Gaming', '/category/apps-update/gaming', (SELECT id FROM navbar_links WHERE slug='/category/apps-update'), 'Gamepad2', 1, 'Mobile & PC gaming'),
('Social', '/category/apps-update/social', (SELECT id FROM navbar_links WHERE slug='/category/apps-update'), 'MessageCircle', 2, 'Social media & messaging apps');

-- Tags (15)
INSERT INTO tags (name, slug) VALUES
('Android', 'android'), ('iOS', 'ios'), ('Windows', 'windows'), ('macOS', 'macos'), ('Linux', 'linux'), ('Other OS', 'other-os'),
('Phones Under 10000', 'phones-under-10000'), ('Phones Under 20000', 'phones-under-20000'), ('Phones Under 30000', 'phones-under-30000'),
('Upcoming Phones', 'upcoming-phones'), ('Latest Phones', 'latest-phones'),
('Laptops Under 30000', 'laptops-under-30000'), ('Laptops Under 40000', 'laptops-under-40000'), ('Laptops Under 50000', 'laptops-under-50000'), ('Laptops Under 60000', 'laptops-under-60000')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- DONE. Restore old content with BACKUP_DATA.sql (optional) or via the admin.
-- ---------------------------------------------------------------------------