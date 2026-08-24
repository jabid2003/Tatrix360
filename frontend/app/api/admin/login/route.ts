import { NextResponse } from 'next/server';
import { createSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/session';

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: '' }));

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[admin login] ADMIN_PASSWORD is not set on the server.');
    return NextResponse.json({ ok: false, error: 'Server misconfigured.' }, { status: 500 });
  }

  if (typeof password !== 'string' || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await createSessionToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches SESSION_DURATION in lib/session.ts
  });

  return response;
}