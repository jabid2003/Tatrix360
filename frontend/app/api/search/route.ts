import { NextResponse } from 'next/server';
import { getPosts, searchPosts } from '@/lib/data';
import { searchArticles, getLatestArticles, type Article } from '@/lib/sections';
import type { Post } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Map a new-architecture Article to the legacy Post shape the search cards
 * (CompactCard / HorizontalCard) render. Article ids are UUIDs — cast for
 * the numeric Post.id field; they are only used as React keys and can never
 * collide with numeric legacy post ids.
 */
function articleToPost(a: Article): Post {
  return {
    id: a.id as unknown as number,
    title: a.title,
    slug: a.slug,
    subtitle: a.subtitle,
    heroImage: a.thumbnailUrl,
    publishedAt: a.publishedAt ?? a.createdAt,
    createdAt: a.createdAt,
    status: a.status,
    isVisible: a.isVisible,
    isLatest: a.isLatest,
    isPinned: a.isPinned,
    articleType: a.articleType,
    author: a.author
      ? { id: a.author.id, name: a.author.name, slug: a.author.slug, bio: a.author.bio, avatar: a.author.avatar }
      : undefined,
    category: a.mainCategory
      ? { id: 0, name: a.mainCategory.displayName, slug: a.mainCategory.slug }
      : undefined,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim();

  const rl = await checkRateLimit('search', ip);
  if (!rl.allowed) {
    return NextResponse.json({ results: [], suggestions: [], error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } });
  }

  try {
    // Search BOTH content stacks: legacy posts + new-architecture articles.
    // (The old code only searched legacy posts, so new articles never appeared.)
    const [legacySuggestions, latestArticles, legacyResults, articleResults] = await Promise.all([
      getPosts({ pageSize: 6 }),
      getLatestArticles(6),
      q ? searchPosts(q) : Promise.resolve([]),
      q ? searchArticles(q) : Promise.resolve([]),
    ]);

    const results: Post[] = [...articleResults.map(articleToPost), ...legacyResults];
    const resultIds = new Set(results.map((post) => post.id));

    const suggestions: Post[] = [
      ...latestArticles.map(articleToPost),
      ...legacySuggestions,
    ]
      .filter((post) => !resultIds.has(post.id))
      .slice(0, 6);

    return NextResponse.json({
      results,
      suggestions,
    });
  } catch (error) {
    console.error('[api/search] error:', error);

    return NextResponse.json(
      {
        results: [],
        suggestions: [],
        error: 'Unable to search posts',
      },
      { status: 500 }
    );
  }
}
