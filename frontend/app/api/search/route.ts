import { NextResponse } from 'next/server';
import { getPosts, searchPosts } from '@/lib/data';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim();

  const rl = await checkRateLimit('search', ip);
  if (!rl.allowed) {
    return NextResponse.json({ results: [], suggestions: [], error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } });
  }

  try {
    const suggestions = await getPosts({
      pageSize: 6,
    });

    if (!q) {
      return NextResponse.json({
        results: [],
        suggestions,
      });
    }

    const results = await searchPosts(q);

    const resultIds = new Set(results.map((post) => post.id));

    const filteredSuggestions = suggestions.filter(
      (post) => !resultIds.has(post.id)
    );

    return NextResponse.json({
      results,
      suggestions: filteredSuggestions,
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