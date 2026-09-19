-- ============================================================================
-- Tatrix360 — Security fix: lock down subcategories + post_categories RLS
-- Migration: 20260916000001_fix_rls_subcategories_post_categories
-- Removes anon INSERT/UPDATE/DELETE on subcategories and post_categories.
-- Safe to re-run (IF EXISTS checks).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. subcategories — remove anon write policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_update_subcategories" ON subcategories;
DROP POLICY IF EXISTS "anon_delete_subcategories" ON subcategories;
DROP POLICY IF EXISTS "authenticated_insert_subcategories" ON subcategories;
DROP POLICY IF EXISTS "authenticated_update_subcategories" ON subcategories;
DROP POLICY IF EXISTS "authenticated_delete_subcategories" ON subcategories;

-- Also drop any generic INSERT/UPDATE/DELETE policies that use WITH CHECK (true)
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'subcategories'
      AND schemaname = 'public'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON subcategories', pol.policyname);
  END LOOP;
END $$;

-- Revoke anon/authenticated write access
REVOKE INSERT, UPDATE, DELETE ON subcategories FROM anon, authenticated;

-- Keep SELECT open for public (read-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subcategories' AND policyname = 'public_read_subcategories' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "public_read_subcategories" ON subcategories
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

GRANT SELECT ON subcategories TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. post_categories — remove anon INSERT/DELETE policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_post_categories" ON post_categories;
DROP POLICY IF EXISTS "anon_delete_post_categories" ON post_categories;
DROP POLICY IF EXISTS "authenticated_insert_post_categories" ON post_categories;
DROP POLICY IF EXISTS "authenticated_delete_post_categories" ON post_categories;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'post_categories'
      AND schemaname = 'public'
      AND cmd IN ('INSERT', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%I" ON post_categories', pol.policyname);
  END LOOP;
END $$;

-- Revoke anon/authenticated write access
REVOKE INSERT, DELETE ON post_categories FROM anon, authenticated;

-- Keep SELECT open for public (read-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_categories' AND policyname = 'public_read_post_categories' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "public_read_post_categories" ON post_categories
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

GRANT SELECT ON post_categories TO anon, authenticated;
