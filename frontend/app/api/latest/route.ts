import { NextResponse } from 'next/server';
import { getLatestPostsPaginated } from '@/lib/data';
import { getLatestArticlesPaginated } from '@/lib/sections';

// Public paginated latest feed: supports both stacks. Default is legacy posts (used by homepage/latest page).
// GET /api/latest?limit=6&offset=0&source=posts|articles
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 6, 1), 24);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const source = searchParams.get('source') === 'articles' ? 'articles' : 'posts';

  if (source === 'articles') {
    const { articles, total } = await getLatestArticlesPaginated(limit, offset);
    return NextResponse.json({
      ok: true,
      source: 'articles',
      items: articles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        subtitle: a.subtitle ?? null,
        thumbnailUrl: a.thumbnailUrl ?? null,
        publishedAt: a.publishedAt ?? null,
        createdAt: a.createdAt ?? null,
        categorySlug: a.mainCategory?.slug ?? null,
        categoryName: a.mainCategory?.displayName ?? null,
        author: a.author ?? null,
        isLatest: a.isLatest,
        isPinned: a.isPinned,
      })),
      total, limit, offset,
    });
  }

  const { posts, total } = await getLatestPostsPaginated(limit, offset);
  return NextResponse.json({
    ok: true,
    source: 'posts',
    items: posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle ?? null,
      heroImage: p.heroImage ?? null,
      publishedAt: p.publishedAt ?? null,
      categorySlug: p.category?.slug ?? null,
      categoryName: p.category?.name ?? null,
      author: p.author ?? null,
    })),
    total, limit, offset,
  });
}
