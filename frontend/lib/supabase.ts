import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During build or when env vars aren't set, create a no-op client that
// returns empty results instead of crashing the build.
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        db: {
          statement_timeout: 30_000,
          request_timeout: 30_000,
        },
      })
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

export { supabase };

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.vercel.app';
