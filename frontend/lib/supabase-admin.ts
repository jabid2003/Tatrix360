import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// During build or when env vars aren't set, create a no-op client that
// returns empty results instead of throwing.  This prevents the rate
// limiter and admin routes from crashing the entire server.
function createAdminClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Admin features and rate limiting will be disabled.'
      );
    }
    // Return a dummy client — queries will fail gracefully with empty results
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: {
      statement_timeout: 30_000,
      request_timeout: 30_000,
    },
  });
}

export const supabaseAdmin = createAdminClient();
