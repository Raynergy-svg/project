import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

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
 * Security middleware for adding security headers and protections
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession();

  // If there's an error or no session and the path requires auth, redirect to login
  const requiresAuth = request.nextUrl.pathname.startsWith('/dashboard') || 
                      request.nextUrl.pathname.startsWith('/settings');

  if ((error || !session) && requiresAuth) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Apply security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set Content-Security-Policy header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.stripe.com; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hcaptcha.com https://*.hcaptcha.com; object-src 'none';"
  );
  
  // Set Strict-Transport-Security header for HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // CSRF Protection for state-changing operations
  if (
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
    !request.nextUrl.pathname.startsWith('/api/public') &&  // Skip for public API endpoints
    !request.nextUrl.pathname.startsWith('/auth/callback')  // Skip for auth callbacks
  ) {
    // Validate CSRF token
    if (!validateCsrfToken(request)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  }
  
  // For GET requests, set a CSRF token if one doesn't exist
  if (request.method === 'GET' && !request.cookies.get('csrfToken')) {
    const csrfToken = uuidv4();
    
    // Set CSRF token cookie with security attributes
    response.cookies.set('csrfToken', csrfToken, {
      httpOnly: true,           // Not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',       // Strict same-site policy
      maxAge: 60 * 60 * 12,     // 12 hours expiry
      path: '/',
    });
    
    // For HTML responses, attach the token to the response for frontend to use
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      request.headers.set('X-CSRF-Token', csrfToken);
    }
  }
  
  // Rate limiting (simple implementation - should be replaced with Redis in production)
  const ip = request.ip || '127.0.0.1';
  const rateLimiter = getRateLimiter();
  
  if (rateLimiter.isRateLimited(ip)) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      }
    });
  }
  
  rateLimiter.incrementCounter(ip);
  
  return response;
}

// Simple in-memory rate limiter (should be replaced with Redis in production)
class RateLimiter {
  private requestCounts: Map<string, number> = new Map();
  private resetTimestamps: Map<string, number> = new Map();
  private readonly MAX_REQUESTS = 100; // Max requests per window
  private readonly WINDOW_MS = 60 * 1000; // 1-minute window
  
  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const resetTime = this.resetTimestamps.get(ip) || 0;
    
    // Reset counter if window has expired
    if (now > resetTime) {
      this.requestCounts.set(ip, 0);
      this.resetTimestamps.set(ip, now + this.WINDOW_MS);
      return false;
    }
    
    const count = this.requestCounts.get(ip) || 0;
    return count >= this.MAX_REQUESTS;
  }
  
  incrementCounter(ip: string): void {
    const count = this.requestCounts.get(ip) || 0;
    this.requestCounts.set(ip, count + 1);
    
    // Set reset time if it doesn't exist
    if (!this.resetTimestamps.has(ip)) {
      this.resetTimestamps.set(ip, Date.now() + this.WINDOW_MS);
    }
  }
}

// Singleton rate limiter instance
let rateLimiter: RateLimiter;

function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter();
  }
  return rateLimiter;
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth routes (signin, signup)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|signin|signup).*)',
  ],
};

// Protected route middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// CORS middleware configuration
export const corsConfig = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}; 