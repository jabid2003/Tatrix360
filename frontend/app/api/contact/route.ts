import { NextResponse } from 'next/server';
import { submitContact } from '@/lib/data';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import { contactSchema } from '@/lib/validation';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit('contact', ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  const csrfToken = req.headers.get('x-csrf-token');
  if (!csrfToken || !(await verifyCsrfToken(csrfToken))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Invalid input';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, email, message, company } = parsed.data;

  if (company) return NextResponse.json({ ok: true });

  const result = await submitContact(name, email, message);
  if (!result.ok) {
    console.error('Contact submit failed:', result.error);
    return NextResponse.json({ error: 'Could not submit' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
