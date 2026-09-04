import { NextResponse } from 'next/server';
import { getPostsByTag, getInitialOSPosts } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get('pageSize') ?? '3', 10) || 3));

  if (!tag) {
    // Return initial OS posts (1 per tag)
    const initial = await getInitialOSPosts();
    return NextResponse.json({ posts: initial.flatMap((g) => g.posts), total: null });
  }

  const { posts, total } = await getPostsByTag(tag, page, pageSize);
  return NextResponse.json({ posts, total });
}
