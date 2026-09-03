-- Add section column to menu_items for primary/secondary nav bars
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'primary';

-- Clear existing menu items and seed fresh
DELETE FROM menu_items;

-- Primary navigation
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Home', '/', 0, 'primary'),
('AI', '/category/ai', 1, 'primary'),
('News', '/category/news', 2, 'primary'),
('Gadgets', '/category/gadgets', 3, 'primary'),
('Do you know?', '/category/do-you-know', 4, 'primary'),
('About', '/about', 5, 'primary');

-- Secondary navigation
INSERT INTO menu_items (label, url, sort_order, section) VALUES
('Featured', '/latest', 0, 'secondary'),
('OS', '/os', 1, 'secondary'),
('Mobile', '/mobile', 2, 'secondary'),
('Laptop', '/laptop', 3, 'secondary'),
('Apps', '/category/apps', 4, 'secondary'),
('New Articles', '/latest', 5, 'secondary'),
('How-to', '/category/how-to', 6, 'secondary');

-- Ensure required tags exist for OS filtering
INSERT INTO tags (name, slug) VALUES
('Android', 'android'),
('iOS', 'ios'),
('Windows', 'windows'),
('macOS', 'macos'),
('Linux', 'linux'),
('Other OS', 'other-os')
ON CONFLICT (slug) DO NOTHING;

-- Ensure required tags exist for product lists
INSERT INTO tags (name, slug) VALUES
('Phones Under 10000', 'phones-under-10000'),
('Phones Under 20000', 'phones-under-20000'),
('Phones Under 30000', 'phones-under-30000'),
('Upcoming Phones', 'upcoming-phones'),
('Latest Phones', 'latest-phones'),
('Laptops Under 30000', 'laptops-under-30000'),
('Laptops Under 40000', 'laptops-under-40000'),
('Laptops Under 50000', 'laptops-under-50000'),
('Laptops Under 60000', 'laptops-under-60000')
ON CONFLICT (slug) DO NOTHING;

-- Index for faster tag-based queries
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags (tag_id);
