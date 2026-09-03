import { NextResponse } from 'next/server';
import { updateSubcategory, deleteSubcategory } from '@/lib/data';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid subcategory id.' }, { status: 400 });
    }

    const body = await request.json();

    const name = typeof body?.name === 'string' ? body.name : undefined;
    const slug = typeof body?.slug === 'string' ? body.slug : undefined;
    const categoryId = body?.categoryId !== undefined ? Number(body.categoryId) : undefined;
    const description = typeof body?.description === 'string' ? body.description : undefined;
    const sortOrder = body?.sortOrder !== undefined ? Number(body.sortOrder) : undefined;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Subcategory name cannot be empty.' }, { status: 400 });
    }
    if (slug !== undefined && !slug.trim()) {
      return NextResponse.json({ ok: false, error: 'Slug cannot be empty.' }, { status: 400 });
    }

    const result = await updateSubcategory(id, {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(categoryId !== undefined && Number.isFinite(categoryId) ? { categoryId } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(sortOrder !== undefined && Number.isFinite(sortOrder) ? { sortOrder } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin subcategories PATCH] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to update subcategory.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid subcategory id.' }, { status: 400 });
    }

    const result = await deleteSubcategory(id);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin subcategories DELETE] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete subcategory.' }, { status: 500 });
  }
}