import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

/**
 * Same-origin check for state-changing admin API calls (CSRF defense).
 * Browsers always send Origin (or Referer) on cross-site POST/PATCH/DELETE,
 * so a mismatched host means a forged request. Non-browser clients (curl,
 * server-to-server) send neither header and are allowed through — they can't
 * exploit a victim's cookies anyway.
 */
function isSameOrigin(req: NextRequest): boolean {
  const candidate = req.headers.get('origin') ?? req.headers.get('referer');
  if (!candidate) return true;
  try {
    const requestHost = req.headers.get('host') ?? req.nextUrl.host;
    return new URL(candidate).host === requestHost;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoggedIn = token ? await verifySessionToken(token) : false;

  const isLoginPage = pathname === '/adminmja/login';
  const isLoginApi = pathname === '/api/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin/');

  // Never protect the login page or login API themselves — that would
  // create a redirect loop (can't log in if /adminmja/login also requires
  // being logged in).
  if (isLoginPage || isLoginApi) {
    if (isLoginPage && isLoggedIn) {
      return NextResponse.redirect(new URL('/adminmja', request.url));
    }
    const res = NextResponse.next();
    res.headers.set('x-is-admin', '1');
    return res;
  }

  if (!isLoggedIn) {
    // API consumers get JSON; browsers get a redirect.
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }
    const loginUrl = new URL('/adminmja/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated admin API mutations: CSRF + rate-limit protection.
  if (isAdminApi && request.method !== 'GET') {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ ok: false, error: 'Cross-origin request blocked.' }, { status: 403 });
    }
    try {
      const rl = await checkRateLimit('admin-api', getClientIp(request));
      if (!rl.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Too many requests. Try again later.' },
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
        );
      }
    } catch {
      // Fail open: a rate-limiter outage must not lock admins out.
    }
  }

  // Logged in and accessing an admin page.
  const res = NextResponse.next();
  res.headers.set('x-is-admin', '1');
  return res;
}

export const config = {
  matcher: ['/adminmja/:path*', '/api/admin/:path*'],
};
