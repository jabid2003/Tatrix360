import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { updateAuthor, deleteAuthor } from '@/lib/authors';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
    const res = await updateAuthor(id, {
      name: typeof body.name === 'string' ? body.name : undefined,
      bio: typeof body.bio === 'string' ? body.bio : undefined,
      role: typeof body.role === 'string' ? body.role : undefined,
      avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : typeof body.avatar === 'string' ? body.avatar : body.avatar_url !== undefined ? body.avatar_url : undefined,
      websiteUrl: typeof body.websiteUrl === 'string' ? body.websiteUrl : body.website_url !== undefined ? body.website_url : undefined,
      isActive: body.isActive !== undefined ? !!body.isActive : body.is_active !== undefined ? !!body.is_active : undefined,
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin authors PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Failed to update author.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });
    const res = await deleteAuthor(id);
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin authors DELETE]', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete author.' }, { status: 500 });
  }
}
