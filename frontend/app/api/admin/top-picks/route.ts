import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getAdminProducts, getTopPicks, setTopPicks, getTopListMeta, setTopListMeta, type ProductCategory } from '@/lib/products';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAdminActivity } from '@/lib/admin-log';

function isValidCategory(v: unknown): v is ProductCategory {
  return v === 'mobile' || v === 'laptop' || v === 'gadget';
}

const CATEGORY_TO_SPECS_SLUG: Record<ProductCategory, string> = {
  mobile: 'mobiles',
  laptop: 'laptops',
  gadget: 'gadgets',
};

// GET ?category=mobile -> { top: {product, sort_order}[], all: Product[] }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  if (!category || !isValidCategory(category)) {
    return NextResponse.json({ ok: false, error: 'category must be mobile, laptop, or gadget' }, { status: 400 });
  }
  const [picks, all, about] = await Promise.all([
    (async () => {
      const ids = await getTopPicks(category);
      if (ids.length === 0) return [];
      const { data } = await supabaseAdmin.from('products').select('*').in('id', ids.map((x) => x.productId));
      const map = new Map((data ?? []).map((r: any) => [r.id, r]));
      return ids.map((p) => {
        const row = map.get(p.productId);
        return row ? { sort_order: p.sortOrder, product: row } : null;
      }).filter(Boolean);
    })(),
    getAdminProducts({ category, limit: 100 }),
    getTopListMeta(category),
  ]);
  return NextResponse.json({ ok: true, category, picks, products: all, about: about ?? '' });
}

// PUT { category, orderedIds: string[], about?: string } -> replace top picks (any count 0..50) + about text
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidCategory(body.category)) {
    return NextResponse.json({ ok: false, error: 'category required' }, { status: 400 });
  }
  const orderedIds: string[] = Array.isArray(body.orderedIds) ? body.orderedIds : Array.isArray(body.productIds) ? body.productIds : [];
  if (orderedIds.length > 50) {
    return NextResponse.json({ ok: false, error: 'Select at most 50 products (or 0 to clear).' }, { status: 400 });
  }
  const result = await setTopPicks(body.category, orderedIds);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  if (typeof body.about === 'string') {
    const aboutRes = await setTopListMeta(body.category, body.about);
    if (!aboutRes.ok) return NextResponse.json({ ok: false, error: aboutRes.error }, { status: 500 });
  }
  void logAdminActivity('update', 'top_picks', null, `${body.category} x ${orderedIds.length}`);
  revalidatePath('/', 'layout');
  revalidatePath('/top', 'layout');
  revalidatePath(`/top/${body.category}`, 'layout');
  revalidatePath(`/specs/${CATEGORY_TO_SPECS_SLUG[body.category as ProductCategory]}`, 'layout');
  return NextResponse.json({ ok: true });
}
