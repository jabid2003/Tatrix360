import { supabaseAdmin } from '@/lib/supabase-admin';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  contact: { max: 5, windowMs: 60 * 60 * 1000 },
  newsletter: { max: 3, windowMs: 60 * 60 * 1000 },
  search: { max: 30, windowMs: 60 * 1000 },
  views: { max: 60, windowMs: 60 * 1000 },
  'admin-login': { max: 5, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  route: string,
  identifier: string
): Promise<RateLimitResult> {
  const limit = LIMITS[route];
  if (!limit) return { allowed: true, remaining: 999 };

  const windowStart = new Date(Date.now() - limit.windowMs).toISOString();

  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('id, count')
    .eq('route', route)
    .eq('identifier', identifier)
    .gte('window_start', windowStart)
    .maybeSingle();

  if (existing) {
    if (existing.count >= limit.max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil(limit.windowMs / 1000),
      };
    }

    const { error } = await supabaseAdmin
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);

    if (error) {
      console.error('[rate-limit] update error:', error.message);
    }

    return {
      allowed: true,
      remaining: limit.max - existing.count - 1,
    };
  }

  const { error: insertError } = await supabaseAdmin
    .from('rate_limits')
    .insert({
      route,
      identifier,
      count: 1,
      window_start: new Date().toISOString(),
    });

  if (insertError) {
    console.error('[rate-limit] insert error:', insertError.message);
  }

  return { allowed: true, remaining: limit.max - 1 };
}

export async function cleanupOldRateLimits(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabaseAdmin
    .from('rate_limits')
    .delete()
    .lt('window_start', cutoff);
}
