import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { updateSection, deleteSection, slugify } from '@/lib/sections';

// Protected by middleware.ts (matcher includes /api/admin/:path*)

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ ok: false, error: 'Invalid section id.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  }

  const patch: {
    title?: string;
    slug?: string;
    mainCategoryId?: string;
    sortOrder?: number;
    isHidden?: boolean;
  } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ ok: false, error: 'Title cannot be empty.' }, { status: 400 });
    }
    patch.title = body.title.trim();
  }
  if (body.slug !== undefined) {
    const slug = slugify(String(body.slug));
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Slug cannot be empty.' }, { status: 400 });
    }
    patch.slug = slug;
  }
  if (body.mainCategoryId !== undefined) patch.mainCategoryId = body.mainCategoryId;
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    patch.sortOrder = Number(body.sortOrder);
  }
  if (body.isHidden !== undefined) patch.isHidden = !!body.isHidden;

  const result = await updateSection(params.id, patch);

  if (!result.ok) {
    const status = /duplicate|unique/i.test(result.error ?? '') ? 409 : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ ok: false, error: 'Invalid section id.' }, { status: 400 });
  }

  // Articles in the section are kept (section_id SET NULL by FK).
  const result = await deleteSection(params.id);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true });
}
