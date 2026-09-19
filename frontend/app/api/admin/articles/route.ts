import { NextResponse } from 'next/server';
import { getAdminArticles } from '@/lib/sections';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'Published' | 'Draft' | undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;
    const articles = await getAdminArticles(
      status ? { status } : {}
    );
    const limited = Number.isFinite(limit) ? articles.slice(0, limit) : articles;
    return NextResponse.json({ ok: true, articles: limited });
  } catch (err) {
    console.error('[admin articles GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load articles.' }, { status: 500 });
  }
}
