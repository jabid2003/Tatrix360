import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { deleteArticle } from '@/lib/sections';
import { logAdminActivity } from '@/lib/admin-log';

// Protected by middleware.ts (matcher includes /api/admin/:path*)
const ACTIONS = ['delete', 'publish', 'draft', 'archive', 'show', 'hide'] as const;
type BulkAction = (typeof ACTIONS)[number];
const MAX_IDS = 100;

/**
 * Bulk article operations (A1): delete / publish / draft / archive / show / hide.
 * POST { action, ids: string[] } -> { ok, updated }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = body?.action as BulkAction | undefined;
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0)
    : [];

  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, error: 'Invalid action.' }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: 'No articles selected.' }, { status: 400 });
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json({ ok: false, error: `Select at most ${MAX_IDS} articles at a time.` }, { status: 400 });
  }

  try {
    let updated = 0;

    if (action === 'delete') {
      for (const id of ids) {
        const r = await deleteArticle(id);
        if (r.ok) updated++;
      }
      if (updated === 0) {
        return NextResponse.json({ ok: false, error: 'Nothing was deleted.' }, { status: 500 });
      }
    } else {
      const patch =
        action === 'publish' ? { status: 'Published' as const } :
        action === 'draft' ? { status: 'Draft' as const } :
        action === 'archive' ? { status: 'Archived' as const } :
        action === 'show' ? { is_visible: true } :
        { is_visible: false };
      const { data, error } = await supabaseAdmin
        .from('articles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .in('id', ids)
        .select('id');
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      updated = data?.length ?? 0;
    }

    void logAdminActivity('bulk', 'article', null, `${action} x ${updated}`);
    revalidatePath('/', 'layout');
    revalidatePath('/latest', 'layout');
    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error('[admin posts bulk]', err);
    return NextResponse.json({ ok: false, error: 'Bulk update failed.' }, { status: 500 });
  }
}
