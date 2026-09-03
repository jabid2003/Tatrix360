import { NextResponse } from 'next/server';
import { deletePost, updatePost, type PostInput } from '@/lib/data';

// Protected by middleware.ts (matcher includes /api/admin/:path*)

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: 'Invalid post id.' }, { status: 400 });
  }

  const result = await deletePost(id);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: 'Invalid post id.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.title !== 'string' || typeof body.slug !== 'string') {
    return NextResponse.json({ ok: false, error: 'Title and slug are required.' }, { status: 400 });
  }

  if (!body.title.trim() || !body.slug.trim()) {
    return NextResponse.json({ ok: false, error: 'Title and slug cannot be empty.' }, { status: 400 });
  }

  // Same "required to publish" rule as the create route.
  const categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  const hasCategories = categoryIds.length > 0 || body.categoryId;

  if (body.status === 'Published') {
    if (!hasCategories) {
      return NextResponse.json({ ok: false, error: 'At least one category is required to publish.' }, { status: 400 });
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
    categoryId: body.categoryId || categoryIds[0],
    categoryIds: categoryIds,
    subcategoryId: Number.isFinite(Number(body.subcategoryId)) ? Number(body.subcategoryId) : undefined,
    authorName: body.authorName || '',
    tagNames: Array.isArray(body.tagNames) ? body.tagNames : [],
    heroImage: body.heroImage || undefined,
    postType: body.postType || undefined,
    seoTitle: body.seoTitle || undefined,
    seoDescription: body.seoDescription || undefined,
    featured: !!body.featured,
    status: body.status || 'Draft',
    readAlsoIds: Array.isArray(body.readAlsoIds) ? body.readAlsoIds : undefined,
  };

  const result = await updatePost(id, input);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: result.post });
}