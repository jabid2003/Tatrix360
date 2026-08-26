import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/data';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import { newsletterSchema } from '@/lib/validation';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit('newsletter', ip);

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
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'A valid email is required' },
      { status: 400 }
    );
  }

  try {
    const result = await subscribeEmail(parsed.data.email);

    if (!result.ok) {
      console.error('Newsletter submit failed:', result.error);
      return NextResponse.json(
        { error: 'Could not subscribe', detail: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('Newsletter route crashed:', detail);
    return NextResponse.json({ error: 'Newsletter server error', detail }, { status: 500 });
  }
}
