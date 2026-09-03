-- TATRIX360 — CLEAN NAVBAR RESET (run in Supabase SQL Editor)
-- This wipes the messy overlapping taxonomy and recreates a clean, non-overlapping structure.
-- After run, rebuild: npm run build

-- 0. Wipe existing taxonomy (posts will lose category refs → SET NULL, safe)
DELETE FROM post_categories;
DELETE FROM post_tags;
-- keep posts but null their refs for clean reseed
UPDATE posts SET category_id = NULL, subcategory_id = NULL;

DELETE FROM subcategories;
DELETE FROM menu_items;
DELETE FROM categories;

-- Manually reset sequences so IDs start clean
-- (optional, keeps IDs tidy after wipe)
-- TRUNCATE categories, subcategories, menu_items RESTART IDENTITY CASCADE;

-- 1. Clean categories — 8 total, no overlap
-- AI / News / Gadgets / How-To are standalone editorial
-- Mobile / Laptop / OS / Apps have subcategories
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

-- 2. Subcategories — only for the 4 category parents that need them
INSERT INTO subcategories (name, slug, category_id, sort_order) VALUES
-- Mobile (5)
('Best Phones Under ₹10,000', 'best-phones-under-10000', (SELECT id FROM categories WHERE slug='mobile'), 0),
('Best Phones Under ₹20,000', 'best-phones-under-20000', (SELECT id FROM categories WHERE slug='mobile'), 1),
('Best Phones Under ₹30,000', 'best-phones-under-30000', (SELECT id FROM categories WHERE slug='mobile'), 2),
('Upcoming Phones in 2026', 'upcoming-phones-2026', (SELECT id FROM categories WHERE slug='mobile'), 3),
('Latest Mobile Phones', 'latest-mobile-phones', (SELECT id FROM categories WHERE slug='mobile'), 4),
-- Laptop (4)
('Best Laptops Under ₹30,000', 'best-laptops-under-30000', (SELECT id FROM categories WHERE slug='laptop'), 0),
('Best Laptops Under ₹40,000', 'best-laptops-under-40000', (SELECT id FROM categories WHERE slug='laptop'), 1),
('Best Laptops Under ₹50,000', 'best-laptops-under-50000', (SELECT id FROM categories WHERE slug='laptop'), 2),
('Best Laptops Under ₹60,000', 'best-laptops-under-60000', (SELECT id FROM categories WHERE slug='laptop'), 3),
-- OS (4) — note: AI/Android/iOS are NOT top-level categories anymore
('Android', 'android', (SELECT id FROM categories WHERE slug='os'), 0),
('iOS', 'ios', (SELECT id FROM categories WHERE slug='os'), 1),
('Windows', 'windows', (SELECT id FROM categories WHERE slug='os'), 2),
('macOS', 'macos', (SELECT id FROM categories WHERE slug='os'), 3),
-- Apps (3)
('Productivity', 'productivity', (SELECT id FROM categories WHERE slug='apps'), 0),
('Gaming', 'gaming', (SELECT id FROM categories WHERE slug='apps'), 1),
('AI Tools', 'ai-tools', (SELECT id FROM categories WHERE slug='apps'), 2)
ON CONFLICT (slug) DO NOTHING;

-- 3. Menu — two-tier, no duplicates, matches new taxonomy
DELETE FROM menu_items;
-- Primary (top bar, always visible)
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Home', '/', 0, 'primary'),
('AI', '/category/ai', 1, 'primary'),
('News', '/category/news', 2, 'primary'),
('Gadgets', '/category/gadgets', 3, 'primary'),
('Do you know?', '/category/do-you-know', 4, 'primary'),
('About', '/about', 5, 'primary');
-- Secondary (bottom bar, dropdowns)
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Featured', '/latest', 0, 'secondary'),
('Mobile', '/category/mobile', 1, 'secondary'),
('Laptop', '/category/laptop', 2, 'secondary'),
('OS', '/category/os', 3, 'secondary'),
('Apps', '/category/apps', 4, 'secondary'),
('How-To', '/category/how-to', 5, 'secondary');

-- 4. Verify
-- SELECT slug, name FROM categories ORDER BY sort_order;
-- SELECT c.slug as cat, s.slug, s.name FROM subcategories s JOIN categories c ON c.id=s.category_id ORDER BY c.sort_order, s.sort_order;
-- SELECT section, label, url FROM menu_items ORDER BY section, sort_order;

-- Done. Now reassign your 2 example articles:
-- UPDATE posts SET category_id=(SELECT id FROM categories WHERE slug='ai'), subcategory_id=NULL WHERE slug='your-ai-article-slug';
-- UPDATE posts SET category_id=(SELECT id FROM categories WHERE slug='os'), subcategory_id=(SELECT id FROM subcategories WHERE slug='android') WHERE slug='your-android-article-slug';
