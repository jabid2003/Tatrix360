import { NextResponse } from 'next/server';
import { getPostsByType, getInitialTypePosts } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get('pageSize') ?? '3', 10) || 3));

  if (!type) {
    // Return initial type posts (1 per type)
    const initial = await getInitialTypePosts();
    return NextResponse.json({ posts: initial.flatMap((g) => g.posts), total: null });
  }

  const { posts, total } = await getPostsByType(type, page, pageSize);
  return NextResponse.json({ posts, total });
}
