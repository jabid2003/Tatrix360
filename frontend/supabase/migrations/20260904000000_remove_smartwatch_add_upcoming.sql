-- TATRIX360 — Remove smartwatch + add upcoming mobile/laptop subcategories
-- Run in Supabase SQL Editor after RESET_NAVBAR_CLEAN.sql or full_reset.sql

-- 1. Remove smartwatch from navbar_links (child of "Top Mobiles & Laptops")
DELETE FROM navbar_links WHERE slug = '/category/top-devices/smartwatches';

-- 2. Remove smartwatch subcategory from subcategories table (if exists)
DELETE FROM subcategories WHERE slug = 'smartwatches' OR slug = 'smartwatch';

-- 3. Add "Upcoming Mobile" and "Upcoming Laptop" as children of "Top Mobiles & Laptops"
INSERT INTO navbar_links (label, slug, parent_id, icon_name, order_index, description) VALUES
  ('Upcoming Mobile', '/category/top-devices/upcoming-mobile',
    (SELECT id FROM navbar_links WHERE slug = '/category/top-devices'),
    'Smartphone', 2, 'Upcoming phones & launch dates'),
  ('Upcoming Laptop', '/category/top-devices/upcoming-laptop',
    (SELECT id FROM navbar_links WHERE slug = '/category/top-devices'),
    'Laptop', 3, 'Upcoming laptops & launch dates')
ON CONFLICT DO NOTHING;

-- 4. Add subcategories for upcoming devices (under top-devices or mobile/laptop)
-- Upcoming Mobile → linked to 'mobile' category
INSERT INTO subcategories (name, slug, category_id, sort_order, is_active) VALUES
  ('Upcoming Mobile', 'upcoming-mobile',
    (SELECT id FROM categories WHERE slug = 'mobile' LIMIT 1),
    5, true)
ON CONFLICT (slug) DO NOTHING;

-- Upcoming Laptop → linked to 'laptop' category
INSERT INTO subcategories (name, slug, category_id, sort_order, is_active) VALUES
  ('Upcoming Laptop', 'upcoming-laptop',
    (SELECT id FROM categories WHERE slug = 'laptop' LIMIT 1),
    4, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Verify
-- SELECT label, slug FROM navbar_links WHERE parent_id = (SELECT id FROM navbar_links WHERE slug='/category/top-devices') ORDER BY order_index;
-- SELECT name, slug, category_id FROM subcategories WHERE slug IN ('upcoming-mobile', 'upcoming-laptop');
