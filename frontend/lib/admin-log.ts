import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Admin activity log (A4).
 * Single-admin setup (one ADMIN_PASSWORD), so entries record action +
 * entity + time rather than a user identity. Logging is fire-and-forget:
 * it must NEVER break the mutation it observes. If the
 * `admin_activity_log` table doesn't exist yet (migration not run), the
 * insert fails silently and the mutation still succeeds.
 */
export async function logAdminActivity(
  action: 'create' | 'update' | 'delete' | 'publish' | 'login' | 'bulk',
  entityType: string,
  entityId?: string | number | null,
  detail?: string | null
): Promise<void> {
  try {
    await supabaseAdmin.from('admin_activity_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId != null ? String(entityId) : null,
      detail: detail ?? null,
    });
  } catch {
    // Intentionally silent — observability must not break mutations.
  }
}
