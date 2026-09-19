import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getMainCategories, createMainCategory } from '@/lib/sections';
import { sanitizeText } from '@/lib/sanitize';

export async function GET() {
  const cats = await getMainCategories();
  return NextResponse.json({ ok: true, categories: cats });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.displayName === 'string' ? body.displayName : typeof body?.name === 'string' ? body.name : '';
  if (!name || !name.trim()) return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 });
  const slug = typeof body?.slug === 'string' && body.slug.trim() ? body.slug.trim() : name;
  const res = await createMainCategory({
    displayName: sanitizeText(name, 120),
    slug,
    description: typeof body?.description === 'string' ? body.description : undefined,
    displayOrder: Number.isFinite(Number(body?.displayOrder ?? body?.display_order)) ? Number(body?.displayOrder ?? body?.display_order) : 0,
    showInNavbar: body?.showInNavbar !== undefined ? !!body.showInNavbar : body?.show_in_navbar !== undefined ? !!body.show_in_navbar : true,
    isActive: body?.isActive !== undefined ? !!body.isActive : body?.is_active !== undefined ? !!body.is_active : true,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 409 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, category: res.category });
}
