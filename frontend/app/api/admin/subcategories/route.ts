import { NextResponse } from 'next/server';
import { createSubcategory } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const categoryId = Number(body?.categoryId);

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Subcategory name is required.' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Slug is required.' }, { status: 400 });
    }
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      return NextResponse.json({ ok: false, error: 'A main category must be selected.' }, { status: 400 });
    }

    const result = await createSubcategory({
      name,
      slug,
      categoryId,
      description: typeof body?.description === 'string' ? body.description : undefined,
      sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, subcategory: result.subcategory });
  } catch (err) {
    console.error('[admin subcategories] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create subcategory.' }, { status: 500 });
  }
}