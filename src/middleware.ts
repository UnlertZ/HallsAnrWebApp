import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'hallsanr_session';

// Public paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/welcome',
  '/owner-login',
  '/login',
  '/api/auth/login-owner',
  '/api/auth/register-visitor',
  '/api/auth/me',
  '/api/auth/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next.js internal files, images, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') // e.g. favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public routes
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Check for session cookie
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  // If no session cookie, force redirect to Visitor Gate Entrance (/welcome)
  if (!sessionCookie) {
    const welcomeUrl = new URL('/welcome', request.url);
    if (pathname !== '/') {
      welcomeUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(welcomeUrl);
  }

  // 4. Decode payload to check role
  try {
    const parts = sessionCookie.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      // Strict protection: /visitor-logs is ONLY for owner
      if (pathname.startsWith('/visitor-logs') && payload.role !== 'owner') {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  } catch {
    // If decoding fails, redirect to welcome
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
