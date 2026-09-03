import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown').trim();
  const rl = await checkRateLimit('views', `${ip}:${slug}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, error: 'Too many views' }, { status: 429 });

  const { data: post, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('id, slug, views')
    .eq('slug', slug)
    .maybeSingle();

  if (fetchError) {
    console.error('[views] Fetch error:', fetchError);

    return NextResponse.json(
      {
        ok: false,
        error: fetchError.message,
      },
      { status: 500 }
    );
  }

  if (!post) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Post not found',
      },
      { status: 404 }
    );
  }

  const nextViews = (post.views ?? 0) + 1;

  const { data: updatedPost, error: updateError } = await supabaseAdmin
    .from('posts')
    .update({
      views: nextViews,
    })
    .eq('id', post.id)
    .select('id, slug, views')
    .single();

  if (updateError) {
    console.error('[views] Update error:', updateError);

    return NextResponse.json(
      {
        ok: false,
        error: updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    views: updatedPost.views,
  });
}