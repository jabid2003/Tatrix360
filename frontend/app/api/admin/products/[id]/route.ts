import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { deleteProduct, getAdminProductById, updateProduct, type ProductInput } from '@/lib/products';
import { pickStr, pickRawStr, pickNum, pickBool, pickStrArray, pickSlug } from '@/lib/api-helpers';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await getAdminProductById(params.id);
    if (!product) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error('[admin products GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load product.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ ok: false, error: 'Product name is required.' }, { status: 400 });
    }
    if (!body.slug || typeof body.slug !== 'string' || !body.slug.trim()) {
      return NextResponse.json({ ok: false, error: 'Slug is required.' }, { status: 400 });
    }
    if (!body.category || !['mobile','laptop','gadget'].includes(body.category)) {
      return NextResponse.json({ ok: false, error: 'Category must be mobile, laptop, or gadget.' }, { status: 400 });
    }

    const input: ProductInput = {
      name: body.name.trim(),
      slug: pickSlug(body) ?? body.slug.trim(),
      brand: pickStr(body, 'brand'),
      category: body.category,
      priceText: pickRawStr(body, 'priceText', 'price_text'),
      priceValue: pickNum(body, 'priceValue', 'price_value'),
      isExpectedPrice: pickBool(body, 'isExpectedPrice', 'is_expected_price', false),
      launchDateText: pickRawStr(body, 'launchDateText', 'launch_date_text'),
      rating: pickNum(body, 'rating'),
      ratingCountText: pickRawStr(body, 'ratingCountText', 'rating_count_text'),
      shortDescription: pickRawStr(body, 'shortDescription', 'short_description'),
      description: pickRawStr(body, 'description'),
      // Omitted (undefined) = preserve existing; [] = explicitly clear.
      images: pickStrArray(body, 'images'),
      thumbnailUrl: pickRawStr(body, 'thumbnailUrl', 'thumbnail_url'),
      specs: Array.isArray(body.specs) ? body.specs : [],
      pros: pickStrArray(body, 'pros') ?? [],
      cons: pickStrArray(body, 'cons') ?? [],
      specialFeatures: pickStrArray(body, 'specialFeatures', 'special_features') ?? [],
      keySpecs: Array.isArray(body.keySpecs) ? body.keySpecs : Array.isArray(body.key_specs) ? body.key_specs : [],
      isVisible: pickBool(body, 'isVisible', 'is_visible', true),
      status: body.status === 'Draft' || body.status === 'Archived' ? body.status : 'Published',
      showUserReviews: pickBool(body, 'showUserReviews', 'show_user_reviews', false),
      readAlsoIds: pickStrArray(body, 'readAlsoIds'),
    };

    const result = await updateProduct(params.id, input);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    revalidatePath('/', 'layout');
    revalidatePath('/specs', 'layout');
    revalidatePath('/top', 'layout');
    return NextResponse.json({ ok: true, product: result.product });
  } catch (err) {
    console.error('[admin products PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteProduct(params.id);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    revalidatePath('/', 'layout');
    revalidatePath('/specs', 'layout');
    revalidatePath('/top', 'layout');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin products DELETE]', err);
    return NextResponse.json({ ok: false, error: 'Failed to delete product.' }, { status: 500 });
  }
}
