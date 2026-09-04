import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const patch: Record<string, unknown> = {};
    const fields: (keyof typeof body)[] = [
      'label',
      'slug',
      'parent_id',
      'is_mega_menu',
      'icon_name',
      'description',
      'order_index',
    ];
    for (const f of fields) {
      if (body?.[f] !== undefined) patch[f] = body[f];
    }
    if (
      typeof patch.label === 'string' &&
      !(patch.label as string).trim()
    ) {
      return NextResponse.json({ ok: false, error: 'Label cannot be empty.' }, { status: 400 });
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nothing to update.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('navbar_links')
      .update(patch)
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin navbar PATCH] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to update navbar link.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from('navbar_links').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin navbar DELETE] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete navbar link.' }, { status: 500 });
  }
}
