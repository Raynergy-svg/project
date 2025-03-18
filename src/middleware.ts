import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles routing cases for the App Router
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Convert the pathname to lowercase for case-insensitive matching
  const lowercasePath = pathname.toLowerCase();
  
  // Handle case-sensitivity in routes - this ensures all routes are lowercase
  // which is the Next.js App Router convention
  if (pathname !== lowercasePath && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const redirectUrl = new URL(lowercasePath + search, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}; 