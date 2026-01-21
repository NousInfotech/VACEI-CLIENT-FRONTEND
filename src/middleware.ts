// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [ '/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(pathname);

  console.log('Middleware Path:', pathname); // Debugging

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('client-token')?.value;
  console.log('token', token ? 'Token found' : 'Token not found'); // Debugging
  console.log('All cookies:', req.cookies.getAll().map(c => c.name)); // Debug all cookies
  
  if (!token) {
    const message = 'Token expired or not valid please login again.';
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(message)}`, req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    
    // Protect onboarding routes - require authentication
    // Onboarding status check is done client-side in the onboarding page itself
    // Dashboard access is checked client-side in the dashboard layout/page
    
    return NextResponse.next(); // Valid token
  } catch (err) {
    console.log('error', err); // Debugging
    const message = 'Token expired please login again.';
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(message)}`, req.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
  ],
};
