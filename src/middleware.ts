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
  console.log('token', token); // Debugging
  if (!token) {
  const message = 'Token expired or not valid please login again.';
   return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(message)}`, req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
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
  ],
};
