import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminArticleById } from '@/lib/sections';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const article = await getAdminArticleById(params.id);
  if (!article) return NextResponse.json({ ok: false, error: 'Article not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
    return NextResponse.json({ ok: false, error: 'orderedIds is required.' }, { status: 400 });
  }

  const ids = body.orderedIds.map(String).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, error: 'Duplicate item ids.' }, { status: 400 });
  }

  // Verify all ids belong to this article
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('article_items')
    .select('id')
    .in('id', ids)
    .eq('article_id', params.id);

  if (checkError) return NextResponse.json({ ok: false, error: 'Validation failed.' }, { status: 400 });
  if (!existing || existing.length !== ids.length) {
    return NextResponse.json({ ok: false, error: 'One or more items do not belong to this article.' }, { status: 400 });
  }

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabaseAdmin
      .from('article_items')
      .update({ display_order: i, updated_at: new Date().toISOString() })
      .eq('id', ids[i])
      .eq('article_id', params.id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}