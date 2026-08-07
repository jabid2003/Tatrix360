import { NextResponse } from 'next/server';
import { getPosts, searchPosts } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

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