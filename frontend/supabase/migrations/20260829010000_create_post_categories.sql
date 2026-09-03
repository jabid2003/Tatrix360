-- Create post_categories join table for multi-category support
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_post_categories" ON post_categories;
CREATE POLICY "anon_select_post_categories" ON post_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_post_categories" ON post_categories;
CREATE POLICY "anon_insert_post_categories" ON post_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_post_categories" ON post_categories;
CREATE POLICY "anon_delete_post_categories" ON post_categories FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories (category_id);

-- Migrate existing single category_id to the new join table
INSERT INTO post_categories (post_id, category_id)
SELECT id, category_id FROM posts WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;
