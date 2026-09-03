import { NextResponse } from 'next/server';
import { createCategory } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Category name is required.' }, { status: 400 });
    }

    const result = await createCategory(name.trim());

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, category: result.category });
  } catch (err) {
    console.error('[admin categories] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create category.' }, { status: 500 });
  }
}
