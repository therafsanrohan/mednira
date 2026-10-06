import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

// Routes accessible without authentication
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/error',
]);

// Routes that are public by prefix (e.g., /e/* for emergency scans)
const PUBLIC_PREFIXES = ['/e/', '/api/v1/emergency/'];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['MEDNIRA_ADMIN', 'MEDNIRA_OPERATIONS', 'MEDNIRA_SUPPORT'],
  '/responder': ['RESPONDER', 'MEDNIRA_ADMIN', 'MEDNIRA_OPERATIONS'],
  '/doctor': ['DOCTOR', 'MEDNIRA_ADMIN'],
  '/org': ['ORGANISATION_ADMIN', 'ORGANISATION_STAFF', 'MEDNIRA_ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public emergency scan routes (no auth required)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow explicit public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Allow NextAuth internal routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check session for all other routes
  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const userRole = (session.user as any).role ?? 'USER';
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
