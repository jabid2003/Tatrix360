import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json({ results: [] });
  const results = await searchPosts(q);
  return NextResponse.json({ results });
}
