import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During build or when env vars aren't set, create a no-op client that
// returns empty results instead of crashing the build.
// NOTE: per-request timeouts are not configured here because the installed
// @supabase/supabase-js version does not support db.statement_timeout /
// db.request_timeout options. Add a fetch wrapper with AbortController if
// query timeouts are ever needed.
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

export { supabase };

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.vercel.app';
