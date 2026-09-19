-- ============================================================================
-- Grant public READ (and service role ALL) across every table + sequence.
-- RLS policies filter rows, but they do NOT grant privileges — Supabase clients
-- (anon/authenticated) need explicit table GRANTs or SELECTs fail with
-- "permission denied for table ...". This script is idempotent and re-runnable.
-- ============================================================================

DO $$
DECLARE
  t TEXT;
  s TEXT;
BEGIN
  -- Public read for anon/authenticated, full admin access for service_role.
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role;', t);
  END LOOP;

  -- Sequences need USAGE, SELECT for inserts/identity columns.
  FOR s IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO anon, authenticated, service_role;', s);
  END LOOP;
END $$;