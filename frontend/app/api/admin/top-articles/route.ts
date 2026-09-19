import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { pinTopArticle, unpinTopArticle } from '@/lib/sections';

// Protected by middleware.ts (matcher includes /api/admin/:path*)

// GET -> pinned top articles (with article + category info), ordered.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('top_articles')
    .select(`
      sort_order,
      articles (
        id, title, slug, thumbnail_url, created_at,
        main_categories (slug, display_name),
        category_sections (title, slug)
      )
    `)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pinned: data ?? [] });
}

// POST { articleId, sortOrder? } -> pin (upsert)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.articleId !== 'string' || !body.articleId) {
    return NextResponse.json({ ok: false, error: 'articleId is required.' }, { status: 400 });
  }
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  const result = await pinTopArticle(body.articleId, sortOrder);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

// DELETE ?articleId=<uuid> -> unpin
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  if (!articleId) {
    return NextResponse.json({ ok: false, error: 'articleId is required.' }, { status: 400 });
  }
  const result = await unpinTopArticle(articleId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
