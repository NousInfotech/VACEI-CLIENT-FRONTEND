// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/onboarding'];

/**
 * Middleware for route protection
 * 
 * APPROACH 2: Backend-only JWT verification
 * - Middleware only checks if token exists (no signature verification)
 * - Backend APIs verify JWT signature using JWT_SECRET
 * - This keeps JWT_SECRET only on the backend (more secure)
 * 
 * Benefits:
 * - No JWT_SECRET needed in frontend codebase
 * - Single source of truth for token verification (backend)
 * - Better security practices
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('Middleware Path:', pathname);

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if token exists in cookie
  // Note: We don't verify the signature here - that's done by the backend
  const token = req.cookies.get('client-token')?.value;
  console.log('Token check:', token ? 'Token found (will be verified by backend)' : 'Token not found');
  
  if (!token) {
    // No token found - redirect to login
    const message = 'Please login to access this page.';
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(message)}`, req.url));
  }

  // Token exists - allow access
  // Backend APIs will verify the token signature when making API calls
  // If token is invalid, backend will return 401 and frontend will handle redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/global-dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
  ],
};
