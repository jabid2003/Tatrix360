import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';

export type ProductCategory = 'mobile' | 'laptop' | 'gadget';

export interface SpecField {
  label: string;
  value: string;
}

export interface SpecSection {
  title: string;
  icon?: string;
  fields: SpecField[];
}

export interface KeySpec {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  priceText?: string;
  priceValue?: number;
  isExpectedPrice?: boolean;
  launchDateText?: string;
  rating?: number;
  ratingCountText?: string;
  shortDescription?: string;
  description?: string;
  images: string[];
  thumbnailUrl?: string;
  specs: SpecSection[];
  pros: string[];
  cons: string[];
  specialFeatures: string[];
  keySpecs: KeySpec[];
  isVisible: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  showUserReviews: boolean;
  readAlsoIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Row + mapper
// ---------------------------------------------------------------------------

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  price_text: string | null;
  price_value: number | null;
  is_expected_price: boolean | null;
  launch_date_text: string | null;
  rating: number | null;
  rating_count_text: string | null;
  short_description: string | null;
  description: string | null;
  images: string[] | null;
  thumbnail_url: string | null;
  specs: unknown;
  pros: string[] | null;
  cons: string[] | null;
  special_features: string[] | null;
  key_specs: unknown;
  is_visible: boolean | null;
  status: string | null;
  show_user_reviews: boolean | null;
  read_also_ids: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

function parseSpecs(raw: unknown): SpecSection[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).map((s: unknown) => {
    const obj = s as Record<string, unknown>;
    const fields = Array.isArray(obj.fields)
      ? (obj.fields as unknown[]).map((f: unknown) => {
          const ff = f as Record<string, unknown>;
          return { label: String(ff.label ?? ''), value: String(ff.value ?? '') };
        }).filter((f) => f.label)
      : [];
    return {
      title: String(obj.title ?? ''),
      icon: obj.icon ? String(obj.icon) : undefined,
      fields,
    };
  }).filter((s) => s.title);
}

function parseKeySpecs(raw: unknown): KeySpec[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).map((k: unknown) => {
    const obj = k as Record<string, unknown>;
    return {
      label: String(obj.label ?? ''),
      value: String(obj.value ?? ''),
      sublabel: obj.sublabel ? String(obj.sublabel) : undefined,
      icon: obj.icon ? String(obj.icon) : undefined,
    };
  }).filter((k) => k.label || k.value);
}

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? undefined,
    category: (r.category as ProductCategory) ?? 'mobile',
    priceText: r.price_text ?? undefined,
    priceValue: r.price_value ?? undefined,
    isExpectedPrice: r.is_expected_price ?? false,
    launchDateText: r.launch_date_text ?? undefined,
    rating: r.rating ?? undefined,
    ratingCountText: r.rating_count_text ?? undefined,
    shortDescription: r.short_description ?? undefined,
    description: r.description ?? undefined,
    images: r.images ?? [],
    thumbnailUrl: r.thumbnail_url ?? undefined,
    specs: parseSpecs(r.specs),
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    specialFeatures: r.special_features ?? [],
    keySpecs: parseKeySpecs(r.key_specs),
    isVisible: r.is_visible ?? true,
    status: (r.status as Product['status']) ?? 'Published',
    showUserReviews: r.show_user_reviews ?? false,
    readAlsoIds: r.read_also_ids ?? undefined,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public reads (anon)
// ---------------------------------------------------------------------------

export async function getProducts(opts: {
  category?: ProductCategory;
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<{ products: Product[]; total: number }> {
  try {
    let q: any = supabase.from('products').select('*', { count: 'exact' })
      .eq('status', 'Published')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    if (opts.category) q = q.eq('category', opts.category);
    if (opts.search) {
      const s = opts.search.replace(/[%_\\]/g, '\\$&');
      q = q.ilike('name', `%${s}%`);
    }
    if (opts.limit) q = q.limit(opts.limit);
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);
    const { data, error, count } = await q;
    if (error || !data) return { products: [], total: 0 };
    return { products: (data as unknown as ProductRow[]).map(mapProduct), total: count ?? data.length };
  } catch { return { products: [], total: 0 }; }
}

export async function getProductsByCategory(category: ProductCategory, limit = 20, offset = 0) {
  return getProducts({ category, limit, offset });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).eq('status', 'Published').eq('is_visible', true).maybeSingle();
    if (error || !data) return null;
    return mapProduct(data as unknown as ProductRow);
  } catch { return null; }
}

export async function getProductBySlugAny(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    return mapProduct(data as unknown as ProductRow);
  } catch { return null; }
}

export async function getTopProducts(category: ProductCategory): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('top_picks').select(`sort_order, products (*)`).eq('category', category).order('sort_order', { ascending: true });
    if (error || !data) return [];
    const out: Product[] = [];
    for (const row of data as unknown as { sort_order: number; products: ProductRow | null }[]) {
      if (row.products) out.push(mapProduct(row.products));
    }
    // Filter to published/visible only for public
    return out.filter((p) => p.status === 'Published' && p.isVisible);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Admin reads/writes (service_role)
// ---------------------------------------------------------------------------

export async function getAdminProducts(filter: {
  category?: ProductCategory;
  status?: Product['status'];
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Product[]> {
  try {
    let q: any = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
    if (filter.category) q = q.eq('category', filter.category);
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.search) {
      const s = filter.search.replace(/[%_\\]/g, '\\$&');
      q = q.ilike('name', `%${s}%`);
    }
    if (filter.limit) q = q.limit(filter.limit);
    if (filter.offset) q = q.range(filter.offset, filter.offset + (filter.limit ?? 20) - 1);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch { return []; }
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapProduct(data as unknown as ProductRow);
  } catch { return null; }
}

export interface ProductInput {
  slug: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  priceText?: string;
  priceValue?: number;
  isExpectedPrice?: boolean;
  launchDateText?: string;
  rating?: number;
  ratingCountText?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  thumbnailUrl?: string;
  specs?: SpecSection[];
  pros?: string[];
  cons?: string[];
  specialFeatures?: string[];
  keySpecs?: KeySpec[];
  isVisible?: boolean;
  status?: 'Draft' | 'Published' | 'Archived';
  showUserReviews?: boolean;
  readAlsoIds?: string[];
}

export function slugifyProduct(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function createProduct(input: ProductInput): Promise<{ ok: boolean; product?: Product; error?: string }> {
  const payload: Record<string, unknown> = {
    slug: slugifyProduct(input.slug || input.name),
    name: input.name.trim(),
    brand: input.brand?.trim() || null,
    category: input.category,
    price_text: input.priceText?.trim() || null,
    price_value: input.priceValue ?? null,
    is_expected_price: !!input.isExpectedPrice,
    launch_date_text: input.launchDateText?.trim() || null,
    rating: input.rating ?? null,
    rating_count_text: input.ratingCountText?.trim() || null,
    short_description: input.shortDescription?.trim() || null,
    description: input.description?.trim() || null,
    images: input.images && input.images.length ? input.images : [],
    thumbnail_url: input.thumbnailUrl || (input.images?.[0] ?? null),
    specs: input.specs ?? [],
    pros: input.pros ?? [],
    cons: input.cons ?? [],
    special_features: input.specialFeatures ?? [],
    key_specs: input.keySpecs ?? [],
    is_visible: input.isVisible ?? true,
    status: input.status ?? 'Published',
    show_user_reviews: !!input.showUserReviews,
    read_also_ids: input.readAlsoIds && input.readAlsoIds.length > 0 ? input.readAlsoIds : null,
  };
  const { data, error } = await supabaseAdmin.from('products').insert(payload).select('id').single();
  if (error || !data) return { ok: false, error: error?.message || 'Failed to create product.' };
  const product = await getAdminProductById((data as { id: string }).id);
  void logAdminActivity('create', 'product', (data as { id: string }).id, input.name);
  return { ok: true, product: product ?? undefined };
}

export async function updateProduct(id: string, input: ProductInput): Promise<{ ok: boolean; product?: Product; error?: string }> {
  const payload: Record<string, unknown> = {
    slug: slugifyProduct(input.slug || input.name),
    name: input.name.trim(),
    brand: input.brand?.trim() || null,
    category: input.category,
    price_text: input.priceText?.trim() || null,
    price_value: input.priceValue ?? null,
    is_expected_price: !!input.isExpectedPrice,
    launch_date_text: input.launchDateText?.trim() || null,
    rating: input.rating ?? null,
    rating_count_text: input.ratingCountText?.trim() || null,
    short_description: input.shortDescription?.trim() || null,
    description: input.description?.trim() || null,
    specs: input.specs ?? [],
    pros: input.pros ?? [],
    cons: input.cons ?? [],
    special_features: input.specialFeatures ?? [],
    key_specs: input.keySpecs ?? [],
    is_visible: input.isVisible ?? true,
    status: input.status ?? 'Published',
    show_user_reviews: !!input.showUserReviews,
    read_also_ids: input.readAlsoIds && input.readAlsoIds.length > 0 ? input.readAlsoIds : null,
    updated_at: new Date().toISOString(),
  };
  // Preserve existing images/thumbnail unless explicitly provided —
  // same data-loss guard as updateArticle (thumbnail wipe bug).
  // Note: thumbnail falls back to images[0] only when a new thumbnail value
  // is explicitly sent without a URL (e.g. cleared in the form).
  if (input.images !== undefined) {
    payload.images = input.images.length ? input.images : [];
  }
  if (input.thumbnailUrl !== undefined) {
    payload.thumbnail_url = input.thumbnailUrl || (input.images?.[0] ?? null);
  }
  const { error } = await supabaseAdmin.from('products').update(payload).eq('id', id);
  if (error) return { ok: false, error: error.message };
  const product = await getAdminProductById(id);
  void logAdminActivity('update', 'product', id, input.name);
  return { ok: true, product: product ?? undefined };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  // also remove from top_picks via cascade
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  void logAdminActivity('delete', 'product', id);
  return { ok: true };
}

export async function getTopPicks(category: ProductCategory): Promise<{ productId: string; sortOrder: number }[]> {
  try {
    const { data, error } = await supabaseAdmin.from('top_picks').select('product_id, sort_order').eq('category', category).order('sort_order', { ascending: true });
    if (error || !data) return [];
    return (data as { product_id: string; sort_order: number }[]).map((r) => ({ productId: r.product_id, sortOrder: r.sort_order ?? 0 }));
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Top list "about" text — one admin-written blurb per category, shown on /top/*
// ---------------------------------------------------------------------------

export async function getTopListMeta(category: ProductCategory): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('top_list_meta').select('about').eq('category', category).maybeSingle();
    if (error || !data) return null;
    return (data as { about: string | null }).about ?? null;
  } catch { return null; }
}

export async function setTopListMeta(category: ProductCategory, about: string | null): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('top_list_meta')
      .upsert({ category, about: about?.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'category' });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save.' };
  }
}

// ---------------------------------------------------------------------------
// Related products — fetch published+visible products by id, admin order kept
// ---------------------------------------------------------------------------

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', unique)
      .eq('status', 'Published')
      .eq('is_visible', true);
    if (error || !data) return [];
    const byId = new Map((data as unknown as ProductRow[]).map((r) => [r.id, mapProduct(r)]));
    return unique.flatMap((id) => (byId.get(id) ? [byId.get(id)!] : []));
  } catch { return []; }
}

export async function setTopPicks(category: ProductCategory, orderedIds: string[]): Promise<{ ok: boolean; error?: string }> {
  if (orderedIds.length > 50) {
    return { ok: false, error: 'Select at most 50 products.' };
  }
  // Replace entire category collection atomically (any count 1..n; 0 clears)
  const { error: delErr } = await supabaseAdmin.from('top_picks').delete().eq('category', category);
  if (delErr) return { ok: false, error: delErr.message };
  if (orderedIds.length === 0) return { ok: true };
  const rows = orderedIds.map((pid, idx) => ({ category, product_id: pid, sort_order: idx }));
  const { error } = await supabaseAdmin.from('top_picks').insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function searchProductsAdmin(query: string, category?: ProductCategory, limit = 20): Promise<Product[]> {
  const q = query.trim().replace(/[%_\\]/g, '\\$&');
  if (!q) return [];
  try {
    let qb: any = supabaseAdmin.from('products').select('*').ilike('name', `%${q}%`).order('created_at', { ascending: false }).limit(limit);
    if (category) qb = qb.eq('category', category);
    const { data, error } = await qb;
    if (error || !data) return [];
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch { return []; }
}
