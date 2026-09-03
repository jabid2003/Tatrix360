-- Tatrix360 — FULL RESET (copy/paste entire file into Supabase → SQL Editor → Run)
-- Order: base schema → menu section/tags → post_categories → subcategories → hardening
-- Safe to re-run: all CREATE use IF NOT EXISTS, INSERT use ON CONFLICT DO NOTHING (except menu reseed)
-- If you want a true wipe, uncomment the DROP section at the bottom first.

-- ============================================================
-- 1. Base schema (categories, authors, tags, posts, post_tags, menu_items, newsletter, contact)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar TEXT,
  role TEXT
);
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  content TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  hero_image TEXT,
  post_type TEXT DEFAULT 'News',
  seo_title TEXT,
  seo_description TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Published',
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  read_also_ids INTEGER[] DEFAULT NULL
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_post_tags" ON post_tags;
CREATE POLICY "anon_select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts (category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors (slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags (slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

-- ============================================================
-- 2. Menu section + required tags seed
-- ============================================================
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'primary';
-- Reseed menu (safe: delete + insert)
DELETE FROM menu_items;
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Home', '/', 0, 'primary'),
('AI', '/category/ai', 1, 'primary'),
('News', '/category/news', 2, 'primary'),
('Gadgets', '/category/gadgets', 3, 'primary'),
('Do you know?', '/category/do-you-know', 4, 'primary'),
('About', '/about', 5, 'primary'),
('Featured', '/latest', 0, 'secondary'),
('OS', '/os', 1, 'secondary'),
('Mobile', '/mobile', 2, 'secondary'),
('Laptop', '/laptop', 3, 'secondary'),
('Apps', '/category/apps', 4, 'secondary'),
('New Articles', '/latest', 5, 'secondary'),
('How-to', '/category/how-to', 6, 'secondary');

INSERT INTO tags (name, slug) VALUES
('Android', 'android'), ('iOS', 'ios'), ('Windows', 'windows'), ('macOS', 'macos'), ('Linux', 'linux'), ('Other OS', 'other-os'),
('Phones Under 10000', 'phones-under-10000'), ('Phones Under 20000', 'phones-under-20000'), ('Phones Under 30000', 'phones-under-30000'),
('Upcoming Phones', 'upcoming-phones'), ('Latest Phones', 'latest-phones'),
('Laptops Under 30000', 'laptops-under-30000'), ('Laptops Under 40000', 'laptops-under-40000'), ('Laptops Under 50000', 'laptops-under-50000'), ('Laptops Under 60000', 'laptops-under-60000')
ON CONFLICT (slug) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags (tag_id);

-- ============================================================
-- 3. post_categories join (multi-category)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_post_categories" ON post_categories;
CREATE POLICY "anon_select_post_categories" ON post_categories FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories (category_id);
INSERT INTO post_categories (post_id, category_id)
SELECT id, category_id FROM posts WHERE category_id IS NOT NULL ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. subcategories (two-tier nav) + posts.subcategory_id
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subcategories" ON subcategories;
CREATE POLICY "anon_select_subcategories" ON subcategories FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON subcategories TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE subcategories_id_seq TO anon, authenticated, service_role;
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories (is_active);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_posts_subcategory_id ON posts (subcategory_id);

-- Seed subcategories (idempotent)
INSERT INTO subcategories (name, slug, category_id, sort_order) VALUES
('Best Phones Under ₹10,000', 'best-phones-under-10000', (SELECT id FROM categories WHERE slug='mobile' LIMIT 1), 0),
('Best Phones Under ₹20,000', 'best-phones-under-20000', (SELECT id FROM categories WHERE slug='mobile' LIMIT 1), 1),
('Best Phones Under ₹30,000', 'best-phones-under-30000', (SELECT id FROM categories WHERE slug='mobile' LIMIT 1), 2),
('Upcoming Phones in 2026', 'upcoming-phones-2026', (SELECT id FROM categories WHERE slug='mobile' LIMIT 1), 3),
('Latest Mobile Phones', 'latest-mobile-phones', (SELECT id FROM categories WHERE slug='mobile' LIMIT 1), 4),
('Best Laptops Under ₹30,000', 'best-laptops-under-30000', (SELECT id FROM categories WHERE slug='laptop' LIMIT 1), 0),
('Best Laptops Under ₹40,000', 'best-laptops-under-40000', (SELECT id FROM categories WHERE slug='laptop' LIMIT 1), 1),
('Best Laptops Under ₹50,000', 'best-laptops-under-50000', (SELECT id FROM categories WHERE slug='laptop' LIMIT 1), 2),
('Best Laptops Under ₹60,000', 'best-laptops-under-60000', (SELECT id FROM categories WHERE slug='laptop' LIMIT 1), 3),
('Android', 'android-sub', (SELECT id FROM categories WHERE slug='os' LIMIT 1), 0),
('iOS', 'ios-sub', (SELECT id FROM categories WHERE slug='os' LIMIT 1), 1),
('Windows', 'windows-sub', (SELECT id FROM categories WHERE slug='os' LIMIT 1), 2),
('macOS', 'macos-sub', (SELECT id FROM categories WHERE slug='os' LIMIT 1), 3),   
('Productivity', 'productivity', (SELECT id FROM categories WHERE slug='apps' LIMIT 1), 0),
('Gaming', 'gaming', (SELECT id FROM categories WHERE slug='apps' LIMIT 1), 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Hardening: revoke anon writes (service_role bypasses RLS) + rate_limits + indexes
-- ============================================================
-- Drop anon write policies (keep SELECT public)
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_authors" ON authors;
DROP POLICY IF EXISTS "anon_update_authors" ON authors;
DROP POLICY IF EXISTS "anon_delete_authors" ON authors;
DROP POLICY IF EXISTS "anon_insert_tags" ON tags;
DROP POLICY IF EXISTS "anon_update_tags" ON tags;
DROP POLICY IF EXISTS "anon_delete_tags" ON tags;
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
DROP POLICY IF EXISTS "anon_insert_post_tags" ON post_tags;
DROP POLICY IF EXISTS "anon_delete_post_tags" ON post_tags;
DROP POLICY IF EXISTS "anon_insert_post_categories" ON post_categories;
DROP POLICY IF EXISTS "anon_delete_post_categories" ON post_categories;
DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_insert_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_update_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_delete_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_select_newsletter" ON newsletter_subscribers;

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  identifier TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_rate_limits_route_identifier_window ON rate_limits (route, identifier, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts (views DESC);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags (post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items (section);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories (slug);

-- Done: re-run `npm run build` — schema cache errors will be gone.
