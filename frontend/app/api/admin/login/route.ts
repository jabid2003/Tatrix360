import { NextResponse } from 'next/server';
import { createSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(request: Request) {
  // Rate-limit login attempts: 5 per hour per IP
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit('admin-login', ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[admin login] ADMIN_PASSWORD is not set on the server.');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured. Set ADMIN_PASSWORD.' },
      { status: 500 }
    );
  }

  if (typeof password !== 'string' || password !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: 'Incorrect password.' },
      { status: 401 }
    );
  }

  let token: string;
  try {
    token = await createSessionToken();
  } catch (err) {
    console.error('[admin login] Failed to create session token:', err);
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured. Set SESSION_SECRET.' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
