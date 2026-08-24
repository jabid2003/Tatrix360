import { NextResponse } from 'next/server';
import { createPost, type PostInput } from '@/lib/data';

// Protected by middleware.ts (matcher includes /api/admin/:path*)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.title !== 'string' || typeof body.slug !== 'string') {
    return NextResponse.json({ ok: false, error: 'Title and slug are required.' }, { status: 400 });
  }

  if (!body.title.trim() || !body.slug.trim()) {
    return NextResponse.json({ ok: false, error: 'Title and slug cannot be empty.' }, { status: 400 });
  }

  if (body.status === 'Published') {
    if (!body.categoryId) {
      return NextResponse.json({ ok: false, error: 'Category is required to publish.' }, { status: 400 });
    }
    if (!body.authorName || !String(body.authorName).trim()) {
      return NextResponse.json({ ok: false, error: 'Author is required to publish.' }, { status: 400 });
    }
    if (!Array.isArray(body.tagNames) || body.tagNames.length === 0) {
      return NextResponse.json({ ok: false, error: 'At least one tag is required to publish.' }, { status: 400 });
    }
  }

  const input: PostInput = {
    title: body.title.trim(),
    slug: body.slug.trim(),
    subtitle: body.subtitle || undefined,
    content: body.content || undefined,
    categoryId: body.categoryId,
    authorName: body.authorName || '',
    tagNames: Array.isArray(body.tagNames) ? body.tagNames : [],
    heroImage: body.heroImage || undefined,
    postType: body.postType || undefined,
    seoTitle: body.seoTitle || undefined,
    seoDescription: body.seoDescription || undefined,
    featured: !!body.featured,
    status: body.status || 'Draft',
  };

  const result = await createPost(input);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: result.post });
}