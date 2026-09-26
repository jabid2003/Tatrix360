import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sanitizeText, sanitizeMultiline, sanitizeUrl, sanitizeRichText, slugify } from '@/lib/sanitize';

export interface ArticleItem {
  id: string;
  articleId: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  brand?: string;
  priceText?: string;
  productUrl?: string;
  /** Linked spec-catalog product (live data renders on the article page). */
  productId?: string;
  badge?: string;
  releaseDate?: string;
  rating?: number;
  pros: string[];
  cons: string[];
  specifications: Record<string, string>;
  displayOrder: number;
  isVisible: boolean;
}

export interface PostItem {
  id: number;
  postId: number;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  brand?: string;
  priceText?: string;
  productUrl?: string;
  badge?: string;
  releaseDate?: string;
  rating?: number;
  pros: string[];
  cons: string[];
  specifications: Record<string, string>;
  displayOrder: number;
  isVisible: boolean;
}

interface ArticleItemRow {
  id: string;
  article_id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  brand: string | null;
  price_text: string | null;
  product_url: string | null;
  product_id: string | null;
  badge: string | null;
  release_date: string | null;
  rating: number | null;
  pros: string[] | null;
  cons: string[] | null;
  specifications: Record<string, string> | null;
  display_order: number;
  is_visible: boolean | null;
}

function mapArticleItem(r: ArticleItemRow): ArticleItem {
  return {
    id: r.id,
    articleId: r.article_id,
    title: r.title,
    slug: r.slug ?? undefined,
    summary: r.summary ?? undefined,
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageAlt: r.image_alt ?? undefined,
    brand: r.brand ?? undefined,
    priceText: r.price_text ?? undefined,
    productUrl: r.product_url ?? undefined,
    productId: r.product_id ?? undefined,
    badge: r.badge ?? undefined,
    releaseDate: r.release_date ?? undefined,
    rating: r.rating ?? undefined,
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    specifications: (r.specifications as Record<string,string>) ?? {},
    displayOrder: r.display_order ?? 0,
    isVisible: r.is_visible ?? true,
  };
}

export async function getArticleItems(articleId: string, includeHidden = false): Promise<ArticleItem[]> {
  try {
    let q = supabase.from('article_items').select('*').eq('article_id', articleId).order('display_order', { ascending: true });
    if (!includeHidden) q = q.eq('is_visible', true);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as unknown as ArticleItemRow[]).map(mapArticleItem);
  } catch { return []; }
}

export async function getArticleItemsAdmin(articleId: string): Promise<ArticleItem[]> {
  return getArticleItems(articleId, true);
}

export async function getPostItems(postId: number, includeHidden = false): Promise<PostItem[]> {
  try {
    let q = supabase.from('post_items').select('*').eq('post_id', postId).order('display_order', { ascending: true });
    if (!includeHidden) q = q.eq('is_visible', true);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as unknown as (ArticleItemRow & { post_id: number })[]).map(r => ({
      id: String(r.id),
      postId: (r as any).post_id,
      title: r.title,
      slug: r.slug ?? undefined,
      summary: r.summary ?? undefined,
      description: r.description ?? undefined,
      imageUrl: r.image_url ?? undefined,
      imageAlt: r.image_alt ?? undefined,
      brand: r.brand ?? undefined,
      priceText: r.price_text ?? undefined,
      productUrl: r.product_url ?? undefined,
      badge: r.badge ?? undefined,
      releaseDate: r.release_date ?? undefined,
      rating: r.rating ?? undefined,
      pros: r.pros ?? [],
      cons: r.cons ?? [],
      specifications: (r.specifications as Record<string,string>) ?? {},
      displayOrder: r.display_order ?? 0,
      isVisible: r.is_visible ?? true,
    })) as unknown as PostItem[];
  } catch { return []; }
}

export interface ArticleItemInput {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  brand?: string;
  priceText?: string;
  productUrl?: string;
  /** UUID of a linked spec product; null clears the link. */
  productId?: string | null;
  badge?: string;
  releaseDate?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
  specifications?: Record<string, string>;
  displayOrder?: number;
  isVisible?: boolean;
}

function sanitizeItemInput(input: ArticleItemInput): { ok: boolean; data?: Required<Pick<ArticleItemInput, 'title'>> & ArticleItemInput; error?: string } {
  const title = sanitizeText(input.title, 200);
  if (!title) return { ok: false, error: 'Item title is required.' };
  let slug: string | undefined;
  if (input.slug && input.slug.trim()) slug = slugify(input.slug);
  else slug = slugify(title);
  if (input.slug && !slug) return { ok: false, error: 'Invalid item slug.' };
  const summary = input.summary ? sanitizeMultiline(input.summary, 2000) : undefined;
  const description = input.description ? sanitizeRichText(input.description, 20000) : undefined;
  const imageUrl = input.imageUrl ? sanitizeUrl(input.imageUrl) : undefined;
  if (input.imageUrl && input.imageUrl.trim() && !imageUrl) return { ok: false, error: 'Item image URL invalid.' };
  const productUrl = input.productUrl ? sanitizeUrl(input.productUrl) : undefined;
  if (input.productUrl && input.productUrl.trim() && !productUrl) return { ok: false, error: 'Product URL must be http(s).' };
  const productId = typeof input.productId === 'string' && input.productId.trim() ? input.productId.trim() : undefined;
  const rating = input.rating !== undefined && input.rating !== null ? Number(input.rating) : undefined;
  if (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 5)) return { ok: false, error: 'Rating must be 0-5.' };
  const pros = (input.pros ?? []).map(v => sanitizeText(v, 300)).filter(Boolean).slice(0, 20);
  const cons = (input.cons ?? []).map(v => sanitizeText(v, 300)).filter(Boolean).slice(0, 20);
  let specs: Record<string,string> = {};
  if (input.specifications && typeof input.specifications === 'object') {
    for (const [k,v] of Object.entries(input.specifications)) {
      const kk = sanitizeText(k, 80);
      const vv = sanitizeText(String(v ?? ''), 300);
      if (kk && vv) specs[kk] = vv;
    }
  }
  return {
    ok: true,
    data: {
      title,
      slug: slug || undefined,
      summary,
      description,
      imageUrl,
      imageAlt: input.imageAlt ? sanitizeText(input.imageAlt, 200) : undefined,
      brand: input.brand ? sanitizeText(input.brand, 120) : undefined,
      priceText: input.priceText ? sanitizeText(input.priceText, 120) : undefined,
      productUrl,
      productId,
      badge: input.badge ? sanitizeText(input.badge, 60) : undefined,
      releaseDate: input.releaseDate || undefined,
      rating,
      pros, cons, specifications: specs,
      displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : 0,
      isVisible: input.isVisible ?? true,
    }
  };
}

export async function createArticleItem(articleId: string, input: ArticleItemInput): Promise<{ ok: boolean; item?: ArticleItem; error?: string }> {
  const s = sanitizeItemInput(input);
  if (!s.ok) return s as any;
  const d = s.data!;
  const { data, error } = await supabaseAdmin.from('article_items').insert({
    article_id: articleId,
    title: d.title,
    slug: d.slug || null,
    summary: d.summary || null,
    description: d.description || null,
    image_url: d.imageUrl || null,
    image_alt: d.imageAlt || null,
    brand: d.brand || null,
    price_text: d.priceText || null,
    product_url: d.productUrl || null,
    product_id: d.productId || null,
    badge: d.badge || null,
    release_date: d.releaseDate || null,
    rating: d.rating ?? null,
    pros: d.pros,
    cons: d.cons,
    specifications: d.specifications,
    display_order: d.displayOrder ?? 0,
    is_visible: d.isVisible ?? true,
  }).select('*').single();
  if (error || !data) return { ok: false, error: error?.message || 'Failed to create item.' };
  return { ok: true, item: mapArticleItem(data as unknown as ArticleItemRow) };
}

export async function updateArticleItem(id: string, input: Partial<ArticleItemInput>): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const t = sanitizeText(input.title, 200);
    if (!t) return { ok: false, error: 'Title cannot be empty.' };
    patch.title = t;
  }
  if (input.slug !== undefined) patch.slug = input.slug ? slugify(input.slug) : null;
  if (input.summary !== undefined) patch.summary = input.summary ? sanitizeMultiline(input.summary, 2000) : null;
  if (input.description !== undefined) patch.description = input.description ? sanitizeRichText(input.description, 20000) : null;
  if (input.imageUrl !== undefined) {
    if (!input.imageUrl) patch.image_url = null;
    else {
      const u = sanitizeUrl(input.imageUrl);
      if (!u) return { ok: false, error: 'Image URL invalid.' };
      patch.image_url = u;
    }
  }
  if (input.imageAlt !== undefined) patch.image_alt = input.imageAlt ? sanitizeText(input.imageAlt, 200) : null;
  if (input.brand !== undefined) patch.brand = input.brand ? sanitizeText(input.brand, 120) : null;
  if (input.priceText !== undefined) patch.price_text = input.priceText ? sanitizeText(input.priceText, 120) : null;
  if (input.productUrl !== undefined) {
    if (!input.productUrl) patch.product_url = null;
    else {
      const u = sanitizeUrl(input.productUrl);
      if (!u) return { ok: false, error: 'Product URL invalid.' };
      patch.product_url = u;
    }
  }
  if (input.productId !== undefined) patch.product_id = input.productId ? input.productId : null;
  if (input.badge !== undefined) patch.badge = input.badge ? sanitizeText(input.badge, 60) : null;
  if (input.releaseDate !== undefined) patch.release_date = input.releaseDate || null;
  if (input.rating !== undefined) patch.rating = input.rating === null || input.rating === undefined ? null : Number(input.rating);
  if (input.pros !== undefined) patch.pros = (input.pros ?? []).map(v => sanitizeText(v, 300)).filter(Boolean);
  if (input.cons !== undefined) patch.cons = (input.cons ?? []).map(v => sanitizeText(v, 300)).filter(Boolean);
  if (input.specifications !== undefined) {
    const specs: Record<string,string> = {};
    if (input.specifications && typeof input.specifications === 'object') {
      for (const [k,v] of Object.entries(input.specifications)) {
        const kk = sanitizeText(k, 80); const vv = sanitizeText(String(v ?? ''), 300);
        if (kk && vv) specs[kk] = vv;
      }
    }
    patch.specifications = specs;
  }
  if (input.displayOrder !== undefined) patch.display_order = Number(input.displayOrder) || 0;
  if (input.isVisible !== undefined) patch.is_visible = !!input.isVisible;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabaseAdmin.from('article_items').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteArticleItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from('article_items').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorderArticleItems(articleId: string, orderedIds: string[]): Promise<{ ok: boolean; error?: string }> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabaseAdmin.from('article_items').update({ display_order: i, updated_at: new Date().toISOString() }).eq('id', orderedIds[i]).eq('article_id', articleId);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}
