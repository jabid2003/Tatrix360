import { NextResponse } from 'next/server';
import { getPostsByTag, getInitialOSPosts } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '3', 10);

  if (!tag) {
    // Return initial OS posts (1 per tag)
    const initial = await getInitialOSPosts();
    return NextResponse.json({ posts: initial.flatMap((g) => g.posts), total: null });
  }

  const { posts, total } = await getPostsByTag(tag, page, pageSize);
  return NextResponse.json({ posts, total });
}
