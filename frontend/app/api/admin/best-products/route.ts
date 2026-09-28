import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { createArticle, getMainCategories, getSectionsByCategory } from '@/lib/sections';
import { createArticleItem } from '@/lib/article-items';
import { getAdminProducts } from '@/lib/products';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';

// Protected by middleware.ts (matcher includes /api/admin/:path*)

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  const clean = slugify(base) || `best-products-${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? clean : `${clean}-${i + 1}`;
    const { data } = await supabaseAdmin.from('articles').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${clean}-${Date.now()}`;
}

/**
 * Publish a "Best Products" list as a listicle article.
 * POST { title, description?, mainCategoryId, sectionId?, orderedIds: string[] }
 * Products are LINKED (product_id) — the same product can appear in many
 * lists (e.g. "Best Phone Under 20k" and "Best Camera Phone").
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const mainCategoryId = typeof body?.mainCategoryId === 'string' ? body.mainCategoryId : '';
  const sectionId = typeof body?.sectionId === 'string' && body.sectionId ? body.sectionId : undefined;
  const orderedIds: string[] = Array.isArray(body?.orderedIds)
    ? body.orderedIds.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0)
    : [];

  if (!title) return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });
  if (orderedIds.length === 0) return NextResponse.json({ ok: false, error: 'Add at least 1 product.' }, { status: 400 });
  if (orderedIds.length > 50) return NextResponse.json({ ok: false, error: 'At most 50 products.' }, { status: 400 });
  if (!mainCategoryId) return NextResponse.json({ ok: false, error: 'Choose a category for the article.' }, { status: 400 });

  const cats = await getMainCategories().catch(() => []);
  if (!cats.some((c) => c.id === mainCategoryId)) {
    return NextResponse.json({ ok: false, error: 'Invalid category.' }, { status: 400 });
  }
  if (sectionId) {
    const sections = await getSectionsByCategory(mainCategoryId, true).catch(() => []);
    if (!sections.some((s) => s.id === sectionId)) {
      return NextResponse.json({ ok: false, error: 'Invalid section for this category.' }, { status: 400 });
    }
  }

  // Resolve products (any status — admin may link drafts; public page shows published+visible only)
  const allProducts = await getAdminProducts({ limit: 500 });
  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const missing = orderedIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: `${missing.length} selected product(s) no longer exist.` }, { status: 400 });
  }

  const slug = await uniqueSlug(title);
  const articleRes = await createArticle({
    title,
    slug,
    subtitle: description ? description.slice(0, 300) : undefined,
    content: description || title,
    mainCategoryId,
    sectionId,
    status: 'Published',
    isVisible: true,
    isLatest: true,
    articleType: 'listicle',
    introContent: description || undefined,
  });
  if (!articleRes.ok || !articleRes.article) {
    return NextResponse.json({ ok: false, error: articleRes.error || 'Failed to create article.' }, { status: 500 });
  }

  const articleId = articleRes.article.id;
  for (let i = 0; i < orderedIds.length; i++) {
    const p = byId.get(orderedIds[i])!;
    const itemRes = await createArticleItem(articleId, {
      title: p.name,
      brand: p.brand,
      priceText: p.priceText,
      imageUrl: p.thumbnailUrl || p.images[0],
      imageAlt: p.name,
      summary: p.shortDescription,
      productId: p.id,
      displayOrder: i,
      isVisible: true,
    });
    if (!itemRes.ok) {
      console.error('[admin best-products] item failed:', itemRes.error);
    }
  }

  void logAdminActivity('create', 'best_products_article', articleId, `${title} (${orderedIds.length} products)`);
  revalidatePath('/', 'layout');
  revalidatePath('/latest', 'layout');
  return NextResponse.json({ ok: true, articleId });
}
