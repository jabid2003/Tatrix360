import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import {
  getSectionsByCategory,
  getMainCategories,
  createSection,
  slugify,
} from '@/lib/sections';

// Protected by middleware.ts (matcher includes /api/admin/:path*)

// GET /api/admin/sections?mainCategoryId=<uuid>  (omit -> all, incl. hidden)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mainCategoryId = searchParams.get('mainCategoryId');

  try {
    if (mainCategoryId) {
      const sections = await getSectionsByCategory(mainCategoryId, true);
      return NextResponse.json({ ok: true, sections });
    }
    const cats = await getMainCategories();
    const grouped = await Promise.all(
      cats.map(async (c) => ({
        category: c,
        sections: await getSectionsByCategory(c.id, true),
      }))
    );
    return NextResponse.json({ ok: true, grouped });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed to load sections.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ ok: false, error: 'Section title is required.' }, { status: 400 });
  }
  if (!body.mainCategoryId || typeof body.mainCategoryId !== 'string') {
    return NextResponse.json({ ok: false, error: 'Main category is required.' }, { status: 400 });
  }

  const slug =
    typeof body.slug === 'string' && body.slug.trim()
      ? slugify(body.slug)
      : slugify(body.title);

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Could not derive a slug from the title.' }, { status: 400 });
  }

  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;

  const result = await createSection({
    mainCategoryId: body.mainCategoryId,
    title: body.title.trim(),
    slug,
    sortOrder,
    isHidden: !!body.isHidden,
  });

  if (!result.ok) {
    const status = /duplicate|unique/i.test(result.error ?? '') ? 409 : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true, section: result.section });
}
