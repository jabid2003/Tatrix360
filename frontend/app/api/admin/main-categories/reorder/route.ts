import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { reorderMainCategories } from '@/lib/sections';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds.filter((x: unknown): x is string => typeof x === 'string') : [];
  if (orderedIds.length === 0) return NextResponse.json({ ok: false, error: 'No IDs provided.' }, { status: 400 });
  const res = await reorderMainCategories(orderedIds);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}