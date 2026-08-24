import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoggedIn = token ? await verifySessionToken(token) : false;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';

  // Never protect the login page or login API themselves — that would
  // create a redirect loop (can't log in if /admin/login also requires
  // being logged in).
  if (isLoginPage || isLoginApi) {
    // But if there's already a valid session and someone lands back on
    // the login page (back button, typed URL, stale bookmark), send them
    // straight to the dashboard instead of showing the form again — this
    // is also what prevents the admin top bar (with Logout) from ever
    // rendering alongside the login form.
    if (isLoginPage && isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};