import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getAdminProducts, getTopPicks, setTopPicks, type ProductCategory } from '@/lib/products';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
  const [picks, all] = await Promise.all([
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
  ]);
  return NextResponse.json({ ok: true, category, picks, products: all });
}

// PUT { category, orderedIds: string[] } -> replace top picks 5 or 10
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidCategory(body.category)) {
    return NextResponse.json({ ok: false, error: 'category required' }, { status: 400 });
  }
  const orderedIds: string[] = Array.isArray(body.orderedIds) ? body.orderedIds : Array.isArray(body.productIds) ? body.productIds : [];
  if (orderedIds.length !== 0 && orderedIds.length !== 5 && orderedIds.length !== 10) {
    return NextResponse.json({ ok: false, error: 'Select exactly 5 or 10 products (or 0 to clear).' }, { status: 400 });
  }
  const result = await setTopPicks(body.category, orderedIds);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  revalidatePath('/', 'layout');
  revalidatePath('/top', 'layout');
  revalidatePath(`/top/${body.category}`, 'layout');
  revalidatePath(`/specs/${CATEGORY_TO_SPECS_SLUG[body.category as ProductCategory]}`, 'layout');
  return NextResponse.json({ ok: true });
}
