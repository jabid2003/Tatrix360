import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getAuthorsAdmin, createAuthor } from '@/lib/authors';

export async function GET() {
  try {
    const authors = await getAuthorsAdmin();
    return NextResponse.json({ ok: true, authors });
  } catch (err) {
    console.error('[admin authors GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load authors.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 });
    }
    const res = await createAuthor({
      name: body.name,
      bio: typeof body.bio === 'string' ? body.bio : undefined,
      role: typeof body.role === 'string' ? body.role : undefined,
      avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : typeof body.avatar_url === 'string' ? body.avatar_url : undefined,
      websiteUrl: typeof body.websiteUrl === 'string' ? body.websiteUrl : typeof body.website_url === 'string' ? body.website_url : undefined,
      isActive: body.isActive !== undefined ? !!body.isActive : body.is_active !== undefined ? !!body.is_active : true,
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: res.error?.includes('already exists') ? 409 : 400 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, author: res.author });
  } catch (err) {
    console.error('[admin authors POST]', err);
    return NextResponse.json({ ok: false, error: 'Failed to create author.' }, { status: 500 });
  }
}
