import { NextResponse } from 'next/server';
import { getHomepageFeatured, addHomepageFeatured, removeHomepageFeatured, toggleHomepageFeaturedVisibility, renameHomepageFeatured, updateHeadingIcon, reorderHomepageFeatured } from '@/lib/sections';
import { revalidateContent } from '@/lib/revalidate';

export async function GET() {
  try {
    const items = await getHomepageFeatured();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('[homepage-featured GET]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.categorySlug !== 'string' || !body.categorySlug.trim()) {
      return NextResponse.json({ ok: false, error: 'Category slug is required.' }, { status: 400 });
    }
    if (!body.articleId || typeof body.articleId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Article ID is required.' }, { status: 400 });
    }
    const result = await addHomepageFeatured(body.categorySlug.trim(), body.articleId);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[homepage-featured POST]', err);
    return NextResponse.json({ ok: false, error: 'Failed to add.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: 'Request body is required.' }, { status: 400 });
    }
    if (body.action === 'updateIcon' && typeof body.categorySlug === 'string') {
      const result = await updateHeadingIcon(body.categorySlug.trim(), body.icon || null);
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      revalidateContent();
      return NextResponse.json({ ok: true });
    }
    if (body.action === 'rename' && typeof body.oldCategorySlug === 'string' && typeof body.newCategorySlug === 'string') {
      const result = await renameHomepageFeatured(body.oldCategorySlug.trim(), body.newCategorySlug.trim());
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      revalidateContent();
      return NextResponse.json({ ok: true });
    }
    if (typeof body.id !== 'string') {
      return NextResponse.json({ ok: false, error: 'ID is required.' }, { status: 400 });
    }
    if (body.action === 'remove') {
      const result = await removeHomepageFeatured(body.id);
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      revalidateContent();
      return NextResponse.json({ ok: true });
    }
    if (body.action === 'toggle' && typeof body.isVisible === 'boolean') {
      const result = await toggleHomepageFeaturedVisibility(body.id, body.isVisible);
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      revalidateContent();
      return NextResponse.json({ ok: true });
    }
    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      const result = await reorderHomepageFeatured(body.orderedIds);
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      revalidateContent();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('[homepage-featured PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Failed to update.' }, { status: 500 });
  }
}
