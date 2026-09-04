import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('navbar_links')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, links: data ?? [] });
  } catch (err) {
    console.error('[admin navbar] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load navbar links.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label, slug, parent_id, is_mega_menu, icon_name, description, order_index } = body;

    if (!label || typeof label !== 'string' || !label.trim()) {
      return NextResponse.json({ ok: false, error: 'Label is required.' }, { status: 400 });
    }
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json({ ok: false, error: 'Slug (URL) is required.' }, { status: 400 });
    }

    const order = typeof order_index === 'number' ? order_index : 0;

    const { data, error } = await supabaseAdmin
      .from('navbar_links')
      .insert({
        label: label.trim(),
        slug: slug.trim(),
        parent_id: parent_id ?? null,
        is_mega_menu: !!is_mega_menu,
        icon_name: icon_name ?? null,
        description: description ?? null,
        order_index: order,
      })
      .select('*')
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, link: data });
  } catch (err) {
    console.error('[admin navbar] POST error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create navbar link.' }, { status: 500 });
  }
}
