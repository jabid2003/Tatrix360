-- Subcategories: two-tier navigation
-- Run this in Supabase Dashboard → SQL Editor

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
CREATE POLICY "anon_select_subcategories" ON subcategories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subcategories" ON subcategories;
CREATE POLICY "anon_insert_subcategories" ON subcategories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subcategories" ON subcategories;
CREATE POLICY "anon_update_subcategories" ON subcategories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subcategories" ON subcategories;
CREATE POLICY "anon_delete_subcategories" ON subcategories FOR DELETE
  TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON subcategories TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE subcategories_id_seq TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories (is_active);

-- Link posts to a subcategory (nullable)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_subcategory_id ON posts (subcategory_id);
