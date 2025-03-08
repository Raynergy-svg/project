/**
 * Simple in-memory rate limiter for Vercel serverless functions
 * Note: This implementation uses server memory, which works for Vercel's 
 * isolated serverless functions but isn't suitable for clustered environments.
 * For production at scale, consider using Redis or similar distributed cache.
 */

// Store rate limit data with expiry
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Configure rate limits for different actions
export interface RateLimitConfig {
  // Maximum number of requests allowed in the window
  maxRequests: number;
  // Time window in seconds
  windowSizeInSeconds: number;
  // Optional identifier for the rate limit type
  identifier?: string;
}

// Default rate limits
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Very strict limits for login attempts to prevent brute force
  login: {
    maxRequests: 5,
    windowSizeInSeconds: 60, // 5 attempts per minute
    identifier: 'login'
  },
  // Moderate limits for signup to prevent mass account creation
  signup: {
    maxRequests: 3,
    windowSizeInSeconds: 60, // 3 attempts per minute
    identifier: 'signup'
  },
  // Less strict for turnstile verification since it's already protected
  'verify-turnstile': {
    maxRequests: 10,
    windowSizeInSeconds: 60, // 10 attempts per minute
    identifier: 'turnstile'
  },
  // Default fallback limits
  default: {
    maxRequests: 20,
    windowSizeInSeconds: 60, // 20 requests per minute
    identifier: 'default'
  }
};

// In-memory store - isolated per serverless function instance
// This will reset when the function cold starts
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Check if a request is rate limited
 * @param key Unique identifier for the rate limit (usually IP + action)
 * @param config Rate limit configuration
 * @returns Object containing whether the request is limited and remaining attempts
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMITS.default
): { limited: boolean; remaining: number; resetTime: number; key: string } {
  const now = Date.now();
  
  // Create entry if it doesn't exist or has expired
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.windowSizeInSeconds * 1000
    };
  }
  
  // Increment counter
  rateLimitStore[key].count++;
  
  // Check if rate limited
  const isLimited = rateLimitStore[key].count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - rateLimitStore[key].count);
  
  return {
    limited: isLimited,
    remaining,
    resetTime: rateLimitStore[key].resetTime,
    key
  };
}

/**
 * Generate a rate limit key from request information
 * @param ip Client IP address
 * @param action Action being performed (login, signup, etc.)
 * @param identifier Optional additional identifier (like user email)
 * @returns A composite key for rate limiting
 */
export function getRateLimitKey(ip: string, action: string, identifier?: string): string {
  if (identifier) {
    return `${action}:${ip}:${identifier}`;
  }
  return `${action}:${ip}`;
}

/**
 * Higher-order function to apply rate limiting to an API handler
 * @param handler The original API handler function
 * @param actionType Type of action for rate limit configuration
 * @returns A new handler function with rate limiting applied
 */
export function withRateLimit(
  handler: (req: any, res: any) => Promise<any>,
  actionType: keyof typeof DEFAULT_RATE_LIMITS = 'default'
) {
  return async (req: any, res: any) => {
    try {
      // Get client IP
      const ip = 
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
      
      // Get identifier (e.g., email for more targeted rate limiting)
      let identifier;
      if (req.body && typeof req.body === 'object') {
        identifier = req.body.email || req.body.identifier;
      }
      
      // Global rate limit by IP
      const ipKey = getRateLimitKey(ip, actionType);
      const ipLimit = checkRateLimit(ipKey, DEFAULT_RATE_LIMITS[actionType]);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', DEFAULT_RATE_LIMITS[actionType].maxRequests);
      res.setHeader('X-RateLimit-Remaining', ipLimit.remaining);
      res.setHeader('X-RateLimit-Reset', Math.floor(ipLimit.resetTime / 1000));
      
      // If rate limited, return 429 Too Many Requests
      if (ipLimit.limited) {
        console.warn(`Rate limit exceeded for ${ipKey}`);
        return res.status(429).json({
          error: 'Too many requests, please try again later',
          retryAfter: Math.ceil((ipLimit.resetTime - Date.now()) / 1000)
        });
      }
      
      // If identifier exists (like email), also apply a more specific rate limit
      if (identifier) {
        const identifierKey = getRateLimitKey(ip, actionType, identifier);
        const identifierLimit = checkRateLimit(identifierKey, DEFAULT_RATE_LIMITS[actionType]);
        
        if (identifierLimit.limited) {
          console.warn(`Specific rate limit exceeded for ${identifierKey}`);
          return res.status(429).json({
            error: 'Too many requests for this account, please try again later',
            retryAfter: Math.ceil((identifierLimit.resetTime - Date.now()) / 1000)
          });
        }
      }
      
      // If not rate limited, proceed to the handler
      return handler(req, res);
    } catch (error) {
      console.error('Error in rate limit middleware:', error);
      return handler(req, res);
    }
  };
}

export default {
  checkRateLimit,
  getRateLimitKey,
  withRateLimit,
  DEFAULT_RATE_LIMITS
}; 