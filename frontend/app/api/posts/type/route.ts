import { NextResponse } from 'next/server';
import { getPostsByType, getInitialTypePosts } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '3', 10);

  if (!type) {
    // Return initial type posts (1 per type)
    const initial = await getInitialTypePosts();
    return NextResponse.json({ posts: initial.flatMap((g) => g.posts), total: null });
  }

  const { posts, total } = await getPostsByType(type, page, pageSize);
  return NextResponse.json({ posts, total });
}
