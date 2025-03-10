import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { securityConfig } from './lib/security/config';
// Initialize polyfills for server-side code
import { initPolyfills } from './utils/polyfills';

// Initialize polyfills at the top of the file
initPolyfills();

/**
 * CSRF Protection: Generate and validate CSRF tokens
 */
const validateCsrfToken = (request: NextRequest): boolean => {
  const token = request.headers.get('X-CSRF-Token');
  const storedToken = request.cookies.get('csrfToken')?.value;
  
  // For GET requests, we don't need to validate tokens
  if (request.method === 'GET') return true;
  
  if (!token || !storedToken || token !== storedToken) {
    return false;
  }
  
  return true;
};

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/support-tickets',
  '/savings',
  '/debt-planner',
  '/admin',
  '/tools',
  '/security',
];

/**
 * Admin-only routes that require admin privileges
 */
const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/analytics',
  '/admin/settings',
];

/**
 * Static asset routes that can be cached longer
 */
const staticAssetPaths = [
  '/images/',
  '/fonts/',
  '/assets/',
  '/_next/static/',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Apply cache-control headers based on route type
 */
const applyCacheHeaders = (request: NextRequest, response: NextResponse): NextResponse => {
  const url = request.nextUrl.pathname;
  
  // Apply long-term caching for static assets
  if (staticAssetPaths.some(path => url.startsWith(path))) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    return response;
  }
  
  // Apply medium-term caching for landing and marketing pages
  if (url === '/' || url.startsWith('/landing/') || url.startsWith('/about/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=60'); // 1 hour client, 1 day CDN
    return response;
  }
  
  // No caching for authenticated routes
  if (protectedRoutes.some(route => url.startsWith(route))) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
  
  // Short-term caching for other routes
  response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60'); // 1 minute client, 5 minutes CDN
  return response;
};

/**
 * Security middleware for adding security headers and protections
 */
export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add compatibility headers if needed
  requestHeaders.set('x-next-enabled', 'true');
  
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This is necessary for SupabaseClient to work properly with Next.js
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Add a CSRF token for forms if it doesn't exist
  if (!request.cookies.has('csrfToken')) {
    const csrfToken = uuidv4();
    response.cookies.set({
      name: 'csrfToken',
      value: csrfToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Apply security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Content Security Policy
  if (securityConfig.enableCSP) {
    response.headers.set(
      'Content-Security-Policy',
      securityConfig.cspHeader
    );
  }

  // Apply cache control headers
  response = applyCacheHeaders(request, response);

  // Check CSRF token for non-GET requests
  if (!validateCsrfToken(request) && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return new NextResponse(
      JSON.stringify({ error: 'CSRF token validation failed' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting
  const ip = request.ip || 'unknown';
  const rateLimiter = getRateLimiter();
  
  if (rateLimiter.isRateLimited(ip)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  rateLimiter.incrementCounter(ip);

  // Check if this is a protected route
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Check auth for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session and trying to access protected route, redirect to login
    if (!session) {
      url.pathname = '/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // If accessing admin routes, check for admin role
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      const { data: userRoleData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!userRoleData || userRoleData.role !== 'admin') {
        url.pathname = '/access-denied';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Rate limiter implementation
class RateLimiter {
  private requestCounts: Map<string, number> = new Map();
  private resetTimestamps: Map<string, number> = new Map();
  private readonly MAX_REQUESTS = 100; // Max requests per window
  private readonly WINDOW_MS = 60 * 1000; // 1-minute window
  
  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const resetTimestamp = this.resetTimestamps.get(ip) || 0;
    
    // Reset counter if window expired
    if (now > resetTimestamp) {
      this.requestCounts.set(ip, 0);
      this.resetTimestamps.set(ip, now + this.WINDOW_MS);
      return false;
    }
    
    const count = this.requestCounts.get(ip) || 0;
    return count >= this.MAX_REQUESTS;
  }
  
  incrementCounter(ip: string): void {
    const now = Date.now();
    const resetTimestamp = this.resetTimestamps.get(ip) || 0;
    
    // Set new window if needed
    if (now > resetTimestamp) {
      this.resetTimestamps.set(ip, now + this.WINDOW_MS);
      this.requestCounts.set(ip, 1);
    } else {
      const count = this.requestCounts.get(ip) || 0;
      this.requestCounts.set(ip, count + 1);
    }
  }
}

// Singleton pattern for rate limiter
let rateLimiterInstance: RateLimiter | null = null;

function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

// CORS middleware configuration
export const corsConfig = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}; 