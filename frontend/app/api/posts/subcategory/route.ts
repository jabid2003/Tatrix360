import { NextResponse } from 'next/server';
import { getPostsBySubcategory } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '5', 10) || 5));

  if (!slug) {
    return NextResponse.json({ posts: [], total: 0 }, { status: 400 });
  }

  const result = await getPostsBySubcategory(slug, pageSize, (page - 1) * pageSize);
  return NextResponse.json({ posts: result.posts, total: result.total });
}