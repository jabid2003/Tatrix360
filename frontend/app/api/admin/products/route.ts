import { NextResponse } from 'next/server';
import { safeRevalidate as revalidatePath } from '@/lib/revalidate';
import { createProduct, getAdminProducts, type ProductInput } from '@/lib/products';
import { pickStr, pickRawStr, pickNum, pickBool, pickStrArray, pickSlug } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ProductInput['category'] | null;
    const search = searchParams.get('search') ?? searchParams.get('q') ?? undefined;
    const status = searchParams.get('status') as ProductInput['status'] | null;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const products = await getAdminProducts({
      category: category && ['mobile','laptop','gadget'].includes(category) ? category : undefined,
      status: status && ['Draft','Published','Archived'].includes(status) ? status : undefined,
      search: search || undefined,
      limit: limit && Number.isFinite(limit) ? limit : 100,
    });
    return NextResponse.json({ ok: true, products });
  } catch (err) {
    console.error('[admin products GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load products.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      images: pickStrArray(body, 'images') ?? [],
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

    const result = await createProduct(input);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    revalidatePath('/', 'layout');
    revalidatePath('/specs', 'layout');
    revalidatePath('/top', 'layout');
    return NextResponse.json({ ok: true, product: result.product });
  } catch (err) {
    console.error('[admin products POST]', err);
    return NextResponse.json({ ok: false, error: 'Failed to create product.' }, { status: 500 });
  }
}
