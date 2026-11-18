import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'token';
const LOGIN_URL = '/login';
const DASHBOARD_URL = '/dashboard';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isLoginPage = request.nextUrl.pathname === LOGIN_URL;

  // No session cookie: allow the login page, redirect everything else to login.
  if (!token) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  // Has a session cookie: never show the login page again; go to dashboard.
  if (isLoginPage) {
    return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
