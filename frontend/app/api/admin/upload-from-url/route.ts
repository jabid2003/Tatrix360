import { NextResponse } from 'next/server';
import { cloudinary, sanitizeTitle } from '@/lib/cloudinary';

/**
 * Upload an image directly from any remote URL. Cloudinary fetches the remote
 * resource on its edge and stores a fresh copy in our cloud, so the saved URL
 * is always res.cloudinary.com — no hostname whitelisting needed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url: unknown = body?.url;
    const title: unknown = body?.title;

    if (typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ ok: false, error: 'No image URL provided.' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid image URL.' }, { status: 400 });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ ok: false, error: 'Image URL must start with http:// or https://.' }, { status: 400 });
    }

    const publicId = typeof title === 'string' && title.trim() ? sanitizeTitle(title) : `image-${Date.now()}`;

    const result = await cloudinary.uploader.upload(url, {
      folder: 'tatrix360',
      public_id: publicId,
      resource_type: 'image',
      unique_filename: false,
      overwrite: true,
    });

    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('[admin upload-from-url] error:', err);
    return NextResponse.json(
      { ok: false, error: 'Unable to import image from that URL. Make sure it is a direct image link.' },
      { status: 422 }
    );
  }
}