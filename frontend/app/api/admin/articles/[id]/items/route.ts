import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { getArticleItemsAdmin, createArticleItem } from '@/lib/article-items';
import { getAdminArticleById } from '@/lib/sections';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const article = await getAdminArticleById(params.id);
  if (!article) return NextResponse.json({ ok: false, error: 'Article not found.' }, { status: 404 });
  const items = await getArticleItemsAdmin(params.id);
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const article = await getAdminArticleById(params.id);
  if (!article) return NextResponse.json({ ok: false, error: 'Article not found.' }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });
  }
  const res = await createArticleItem(params.id, {
    title: body.title,
    slug: typeof body.slug === 'string' ? body.slug : undefined,
    summary: typeof body.summary === 'string' ? body.summary : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : typeof body.image_url === 'string' ? body.image_url : undefined,
    imageAlt: typeof body.imageAlt === 'string' ? body.imageAlt : typeof body.image_alt === 'string' ? body.image_alt : undefined,
    brand: typeof body.brand === 'string' ? body.brand : undefined,
    priceText: typeof body.priceText === 'string' ? body.priceText : typeof body.price_text === 'string' ? body.price_text : undefined,
    productUrl: typeof body.productUrl === 'string' ? body.productUrl : typeof body.product_url === 'string' ? body.product_url : undefined,
    productId: typeof body.productId === 'string' ? body.productId : typeof body.product_id === 'string' ? body.product_id : undefined,
    badge: typeof body.badge === 'string' ? body.badge : undefined,
    releaseDate: typeof body.releaseDate === 'string' ? body.releaseDate : typeof body.release_date === 'string' ? body.release_date : undefined,
    rating: body.rating !== undefined ? Number(body.rating) : undefined,
    pros: Array.isArray(body.pros) ? body.pros : undefined,
    cons: Array.isArray(body.cons) ? body.cons : undefined,
    specifications: body.specifications && typeof body.specifications === 'object' ? body.specifications : undefined,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : body.display_order !== undefined ? Number(body.display_order) : 0,
    isVisible: body.isVisible !== undefined ? !!body.isVisible : body.is_visible !== undefined ? !!body.is_visible : true,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, item: res.item });
}
