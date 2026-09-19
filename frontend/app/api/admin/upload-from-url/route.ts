import { NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { cloudinary, sanitizeTitle } from '@/lib/cloudinary';

const PRIVATE_IP = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|::1$|fe[89ab]c:|f[cd]|0:)/;

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP.test(ip.toLowerCase());
}

function isBlockedUrl(parsed: URL): boolean {
  const host = parsed.hostname;
  if (!host) return true;
  if (parsed.username || parsed.password) return true;
  if (PRIVATE_IP.test(host) || /[0-9]/.test(host[0])) return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) return true;
  return false;
}

/**
 * DNS-rebinding defense: resolve the hostname and reject it if ANY resolved
 * address is private/loopback/link-local. This closes the gap where a
 * hostname passes the static check but resolves to an internal IP when
 * Cloudinary fetches it (or vice versa).
 */
async function resolvesToPrivate(host: string): Promise<boolean> {
  // Literal IPs are already handled by isBlockedUrl; skip DNS for them.
  if (isIP(host)) return false;
  try {
    const records = await lookup(host, { all: true });
    return records.some((r) => isPrivateIp(r.address));
  } catch {
    // Unresolvable host — Cloudinary's fetch would fail anyway.
    return true;
  }
}

/**
 * Upload an image from a remote URL. Cloudinary fetches the remote resource on
 * its edge, then stores a fresh copy in our cloud, so the saved URL is always
 * res.cloudinary.com. Private/internal/loopback/link-local hosts are rejected to
 * guard against SSRF.
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
    if (isBlockedUrl(parsed)) {
      return NextResponse.json({ ok: false, error: 'That URL is not allowed.' }, { status: 400 });
    }
    if (await resolvesToPrivate(parsed.hostname)) {
      return NextResponse.json({ ok: false, error: 'That URL is not allowed.' }, { status: 400 });
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