import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { updateMainCategory, deleteMainCategory } from '@/lib/sections';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  const res = await updateMainCategory(params.id, {
    displayName: typeof body.displayName === 'string' ? body.displayName : typeof body.name === 'string' ? body.name : undefined,
    slug: typeof body.slug === 'string' ? body.slug : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : body.display_order !== undefined ? Number(body.display_order) : undefined,
    showInNavbar: body.showInNavbar !== undefined ? !!body.showInNavbar : body.show_in_navbar !== undefined ? !!body.show_in_navbar : undefined,
    isActive: body.isActive !== undefined ? !!body.isActive : body.is_active !== undefined ? !!body.is_active : undefined,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const res = await deleteMainCategory(params.id);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
