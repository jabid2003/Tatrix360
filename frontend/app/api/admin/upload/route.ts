import { NextResponse } from 'next/server';
import { cloudinary, sanitizeTitle } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Sanitize a blog title into a clean, URL-safe slug for use as Cloudinary public_id.
 * Example: "Top 10 AI Tools in 2026!" → "top-10-ai-tools-in-2026"
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title')?.toString() ?? '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported file type. Use JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'File too large. Max 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64DataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Clean filename from title slug — no timestamps, no random strings
    // Example: title "Best Phones Under 10000" → public_id: "best-phones-under-10000"
    // Resulting URL: https://res.cloudinary.com/dhk3fypaz/image/upload/tatrix360/best-phones-under-10000.png
    const publicId = title ? sanitizeTitle(title) : `image-${Date.now()}`;

    const result = await cloudinary.uploader.upload(base64DataUri, {
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
    console.error('[admin upload] error:', err);
    return NextResponse.json({ ok: false, error: 'Upload failed.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing publicId.' }, { status: 400 });
    }

    if (!publicId.startsWith('tatrix360/')) {
      return NextResponse.json({ ok: false, error: 'Invalid asset.' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return NextResponse.json({ ok: false, error: 'Delete failed.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin delete] error:', err);
    return NextResponse.json({ ok: false, error: 'Delete failed.' }, { status: 500 });
  }
}
