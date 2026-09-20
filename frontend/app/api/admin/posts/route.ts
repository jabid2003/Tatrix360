import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { createArticle, type ArticleInput } from '@/lib/sections';
import { pickStr, pickRawStr, pickNum, pickBool, pickStrArray } from '@/lib/api-helpers';

// Protected by middleware.ts (matcher includes /api/admin/:path*)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.title !== 'string' || typeof body.slug !== 'string') {
    return NextResponse.json({ ok: false, error: 'Title and slug are required.' }, { status: 400 });
  }

  if (!body.title.trim() || !body.slug.trim()) {
    return NextResponse.json({ ok: false, error: 'Title and slug cannot be empty.' }, { status: 400 });
  }

  if (!body.mainCategoryId || typeof body.mainCategoryId !== 'string') {
    return NextResponse.json({ ok: false, error: 'Main category is required.' }, { status: 400 });
  }

  if (!body.content || !String(body.content).trim()) {
    return NextResponse.json({ ok: false, error: 'Content is required.' }, { status: 400 });
  }

  const input: ArticleInput = {
    title: body.title.trim(),
    slug: body.slug.trim(),
    subtitle: pickStr(body, 'subtitle'),
    content: String(body.content),
    thumbnailUrl: pickRawStr(body, 'thumbnailUrl') ?? pickRawStr(body, 'heroImage'),
    mainCategoryId: body.mainCategoryId,
    sectionId: pickStr(body, 'sectionId'),
    authorId: pickNum(body, 'authorId', 'author_id') ?? null,
    seoTitle: pickStr(body, 'seoTitle', 'seo_title'),
    seoDescription: pickStr(body, 'seoDescription', 'seo_description'),
    status: body.status === 'Draft' || body.status === 'Published' || body.status === 'Archived' ? body.status : 'Published',
    publishedAt: pickRawStr(body, 'publishedAt', 'published_at') ?? null,
    isVisible: pickBool(body, 'isVisible', 'is_visible', true),
    isLatest: pickBool(body, 'isLatest', 'is_latest', true),
    isPinned: pickBool(body, 'isPinned', 'is_pinned', false),
    latestOrder: pickNum(body, 'latestOrder', 'latest_order') ?? 0,
    pinnedOrder: pickNum(body, 'pinnedOrder', 'pinned_order') ?? 0,
    articleType: body.articleType === 'listicle' ? 'listicle' : 'standard',
    introContent: pickRawStr(body, 'introContent', 'intro_content'),
    conclusionContent: pickRawStr(body, 'conclusionContent', 'conclusion_content'),
    readAlsoIds: pickStrArray(body, 'readAlsoIds', 'read_also_ids'),
    relatedProductIds: pickStrArray(body, 'relatedProductIds', 'related_product_ids'),
  };

  const result = await createArticle(input);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  revalidatePath('/', 'layout');
  revalidatePath('/latest', 'layout');

  return NextResponse.json({ ok: true, article: result.article });
}
