import { NextResponse } from 'next/server';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? 'dhk3fypaz';
const CLOUDINARY_FOLDER = 'tatrix360';

// Cloudinary transformation params for auto-optimization
const TRANSFORMATIONS = 'f_auto,q_auto';

// Cache: 1 year for images (immutable content via filename-based versioning)
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

// Allowed extensions → MIME types
const EXTENSION_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

/**
 * Image proxy route — masks Cloudinary URLs behind your domain.
 *
 * Usage:
 *   <Image src="/images/my-blog-title.png" ... />
 *
 * Fetches from:
 *   https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{folder}/{filename}
 *
 * Serves back with:
 *   - Your domain as the origin: /images/{filename}
 *   - Correct Content-Type
 *   - Aggressive caching (1 year immutable)
 */
export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    if (!filename) {
      return NextResponse.json({ error: 'Filename required.' }, { status: 400 });
    }

    // Extract extension (everything after the last dot)
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return NextResponse.json({ error: 'Extension required (e.g. .png, .webp).' }, { status: 400 });
    }

    const extension = filename.slice(lastDotIndex + 1).toLowerCase();
    const nameWithoutExt = filename.slice(0, lastDotIndex);

    if (!EXTENSION_MAP[extension]) {
      return NextResponse.json(
        { error: `Unsupported extension: .${extension}. Use jpg, png, webp, gif, or avif.` },
        { status: 400 }
      );
    }

    // Build Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{folder}/{public_id}.{ext}
    const cloudinaryUrl =
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/` +
      `${TRANSFORMATIONS}/${CLOUDINARY_FOLDER}/${nameWithoutExt}.${extension}`;

    // Fetch from Cloudinary
    const response = await fetch(cloudinaryUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour at edge level
    });

    if (!response.ok) {
      // Try without extension in case Cloudinary stored it differently
      const fallbackUrl =
        `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/` +
        `${TRANSFORMATIONS}/${CLOUDINARY_FOLDER}/${nameWithoutExt}`;

      const fallbackResponse = await fetch(fallbackUrl, {
        next: { revalidate: 3600 },
      });

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: 'Image not found on Cloudinary.' },
          { status: 404 }
        );
      }

      // Return fallback response
      const fallbackBody = await fallbackResponse.arrayBuffer();
      const fallbackContentType = fallbackResponse.headers.get('content-type') ?? EXTENSION_MAP[extension];

      return new NextResponse(fallbackBody, {
        status: 200,
        headers: {
          'Content-Type': fallbackContentType,
          'Cache-Control': CACHE_CONTROL,
        },
      });
    }

    // Stream the image back with proper headers
    const imageBody = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') ?? EXTENSION_MAP[extension];

    return new NextResponse(imageBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (err) {
    console.error('[image-proxy] error:', err);
    return NextResponse.json({ error: 'Failed to load image.' }, { status: 500 });
  }
}
