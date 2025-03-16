import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles routing between App Router and Pages Router
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Convert the pathname to lowercase for case-insensitive matching
  const lowercasePath = pathname.toLowerCase();
  
  // If the original path has uppercase but we have a lowercase version in App Router,
  // redirect to the lowercase version
  if (pathname !== lowercasePath && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL(lowercasePath, request.url));
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