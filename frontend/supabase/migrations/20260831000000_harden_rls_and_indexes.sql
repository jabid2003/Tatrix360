-- Production hardening: lock writes to service_role + add rate_limits + missing indexes
-- Run in Supabase Dashboard → SQL Editor
-- This refines the intentionally-open single-tenant RLS from 20260803 so that
-- only the server (service_role key via supabaseAdmin) can mutate data.
-- Public (anon/authenticated) keeps SELECT only.

-- ---------------------------------------------------------------------------
-- 1. Revoke anon write on all content tables — keep SELECT public
-- ---------------------------------------------------------------------------

-- categories
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
-- anon_select_categories already exists — keep it
-- service_role bypasses RLS, so no extra policy needed; create explicit for clarity if you later restrict service_role
-- (service_role bypasses RLS by default, so writes via supabaseAdmin will still work)

-- authors
DROP POLICY IF EXISTS "anon_insert_authors" ON authors;
DROP POLICY IF EXISTS "anon_update_authors" ON authors;
DROP POLICY IF EXISTS "anon_delete_authors" ON authors;

-- tags
DROP POLICY IF EXISTS "anon_insert_tags" ON tags;
DROP POLICY IF EXISTS "anon_update_tags" ON tags;
DROP POLICY IF EXISTS "anon_delete_tags" ON tags;

-- posts
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;

-- post_tags
DROP POLICY IF EXISTS "anon_insert_post_tags" ON post_tags;
DROP POLICY IF EXISTS "anon_delete_post_tags" ON post_tags;
-- add update for completeness (no policy before, but lock it)
DROP POLICY IF EXISTS "anon_update_post_tags" ON post_tags;

-- post_categories
DROP POLICY IF EXISTS "anon_insert_post_categories" ON post_categories;
DROP POLICY IF EXISTS "anon_delete_post_categories" ON post_categories;
DROP POLICY IF EXISTS "anon_update_post_categories" ON post_categories;

-- menu_items
DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;

-- subcategories (created in 20260830)
DROP POLICY IF EXISTS "anon_insert_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_update_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_delete_subcategories" ON subcategories;
-- anon_select_subcategories kept

-- newsletter_subscribers — keep insert public (needed for subscribe form), lock select to service_role
DROP POLICY IF EXISTS "anon_select_newsletter" ON newsletter_subscribers;
-- anon_insert_newsletter kept intentionally (public can subscribe)
-- add service_role select for admin reads (service_role bypasses anyway, but be explicit if you tighten)

-- contact_submissions — already insert-only for anon, which is correct; add select for service_role via bypass
-- no change

-- ---------------------------------------------------------------------------
-- 2. rate_limits table (was missing, used by lib/rate-limit.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  identifier TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No anon policies — only service_role (via supabaseAdmin) touches this table
-- service_role bypasses RLS, so no policy needed

CREATE INDEX IF NOT EXISTS idx_rate_limits_route_identifier_window ON rate_limits (route, identifier, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- 3. Missing performance indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
-- fallback btree for LIKE without pg_trgm
CREATE INDEX IF NOT EXISTS idx_posts_title_btree ON posts (title);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts (views DESC);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags (post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories (category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items (section);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories (slug);

-- Enable pg_trgm for title search (safe to re-run)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
