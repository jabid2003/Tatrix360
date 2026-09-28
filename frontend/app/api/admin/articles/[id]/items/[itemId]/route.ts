import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { updateArticleItem, deleteArticleItem } from '@/lib/article-items';

export async function PATCH(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  const res = await updateArticleItem(params.itemId, {
    title: typeof body.title === 'string' ? body.title : undefined,
    slug: typeof body.slug === 'string' ? body.slug : undefined,
    summary: typeof body.summary === 'string' ? body.summary : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : typeof body.image_url === 'string' ? body.image_url : undefined,
    imageAlt: typeof body.imageAlt === 'string' ? body.imageAlt : typeof body.image_alt === 'string' ? body.image_alt : undefined,
    brand: typeof body.brand === 'string' ? body.brand : undefined,
    priceText: typeof body.priceText === 'string' ? body.priceText : typeof body.price_text === 'string' ? body.price_text : undefined,
    productUrl: typeof body.productUrl === 'string' ? body.productUrl : typeof body.product_url === 'string' ? body.product_url : undefined,
    productId: body.productId === null || body.product_id === null ? null : typeof body.productId === 'string' ? body.productId : typeof body.product_id === 'string' ? body.product_id : undefined,
    badge: typeof body.badge === 'string' ? body.badge : undefined,
    releaseDate: typeof body.releaseDate === 'string' ? body.releaseDate : typeof body.release_date === 'string' ? body.release_date : undefined,
    rating: body.rating !== undefined ? (body.rating === null ? null as unknown as undefined : Number(body.rating)) : undefined,
    pros: Array.isArray(body.pros) ? body.pros : undefined,
    cons: Array.isArray(body.cons) ? body.cons : undefined,
    specifications: body.specifications && typeof body.specifications === 'object' ? body.specifications : undefined,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : body.display_order !== undefined ? Number(body.display_order) : undefined,
    isVisible: body.isVisible !== undefined ? !!body.isVisible : body.is_visible !== undefined ? !!body.is_visible : undefined,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { itemId: string } }) {
  const res = await deleteArticleItem(params.itemId);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
