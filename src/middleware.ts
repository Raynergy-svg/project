import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

/**
 * This middleware handles:
 * 1. Supabase auth session management (token refreshing)
 * 2. Routing during the migration from Pages Router to App Router
 * 
 * It ensures:
 * - Auth tokens are refreshed when needed
 * - All routes are properly handled by the App Router
 * - Pages that have been migrated are listed in the appRouterPages array
 */
export async function middleware(request: NextRequest) {
  // First handle Supabase auth session
  const response = await updateSession(request);
  
  const { pathname, search } = request.nextUrl;
  
  // Convert the pathname to lowercase for case-insensitive matching
  const lowercasePath = pathname.toLowerCase();
  
  // Handle case-sensitivity in routes - this ensures all routes are lowercase
  // which is the Next.js App Router convention
  if (pathname !== lowercasePath && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const redirectUrl = new URL(lowercasePath + search, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // List of routes that have been migrated to App Router
  // As pages are migrated from Pages Router to App Router, add them to this list
  const appRouterPages = [
    // Core pages already migrated
    '/about', '/about/',
    '/careers', '/careers/',
    '/blog', '/blog/',
    '/dashboard', '/dashboard/',
    '/auth', '/auth/',
    '/help', '/help/',
    '/privacy', '/privacy/',
    '/security', '/security/',
    '/status', '/status/',
    '/terms', '/terms/',
    '/apply', '/apply/',
    // Error pages
    '/access-denied', '/access-denied/',
    // Add newly migrated pages here as they are converted
  ];
  
  // Check if this path or any parent path is handled by App Router
  const isAppRouterPath = (path: string) => {
    // Exact match
    if (appRouterPages.includes(path)) return true;
    
    // Check if it's a child route of an App Router page
    return appRouterPages.some(appPath => 
      // Only consider parent paths that end with slash
      appPath.endsWith('/') && path.startsWith(appPath)
    );
  };
  
  // If the path should be handled by App Router, set a header to track usage
  if (isAppRouterPath(lowercasePath)) {
    const response = NextResponse.next();
    response.headers.set('x-using-app-router', 'true');
    return response;
  }
  
  // Redirect dashboard pages to the App Router version
  if (lowercasePath.startsWith('/dashboard/')) {
    const newPath = lowercasePath;
    const redirectUrl = new URL(newPath + search, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Important: Include any routes that need Supabase Auth token management
    // as well as routing logic
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