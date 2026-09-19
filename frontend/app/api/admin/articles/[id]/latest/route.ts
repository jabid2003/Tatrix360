import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { setArticleLatest } from '@/lib/sections';

// Protected by middleware.ts (matcher includes /api/admin/:path*)
// POST { isLatest: true|false } -> quick toggle for the "Latest" flag.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ ok: false, error: 'Invalid article id.' }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const isLatest = body?.isLatest === true;

  const result = await setArticleLatest(params.id, isLatest);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  revalidatePath('/', 'layout');
  revalidatePath('/latest', 'layout');
  return NextResponse.json({ ok: true });
}