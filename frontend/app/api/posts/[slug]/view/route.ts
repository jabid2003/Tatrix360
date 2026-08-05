import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, views')
    .eq('slug', slug)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({ views: (post.views ?? 0) + 1 })
    .eq('id', post.id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}