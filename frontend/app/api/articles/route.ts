import { NextResponse } from 'next/server';
import { getArticlesBySection } from '@/lib/sections';

// Public offset-pagination endpoint for hub "View More" and section pages.
// GET /api/articles?sectionId=<uuid>&limit=6&offset=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId') || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 6, 1), 24);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  if (!sectionId) {
    return NextResponse.json({ ok: false, error: 'sectionId is required.' }, { status: 400 });
  }

  const { articles, total } = await getArticlesBySection(sectionId, limit, offset);

  return NextResponse.json({
    ok: true,
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      thumbnailUrl: a.thumbnailUrl ?? null,
      createdAt: a.createdAt ?? null,
      categorySlug: a.mainCategory?.slug ?? null,
      sectionSlug: a.section?.slug ?? null,
    })),
    total,
    limit,
    offset,
  });
}
