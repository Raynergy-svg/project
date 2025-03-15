/**
 * Cookies utility for handling cookies in a privacy-friendly way
 * This implements proper SameSite attributes to avoid third-party cookie warnings
 */

// Default cookie options
const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: 'Lax',
  secure: true,
  partitioned: false,
};

// Cookie options type
export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  partitioned?: boolean; // CHIPS partitioning
}

/**
 * Get a cookie by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  return cookie ? cookie.split('=')[1] : null;
}

/**
 * Set a cookie with proper privacy attributes
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;
  
  // Merge with default options
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Build cookie string
  let cookie = `${name}=${value}`;
  
  // Add options
  if (opts.expires) {
    cookie += `; Expires=${opts.expires.toUTCString()}`;
  } else if (opts.maxAge !== undefined) {
    cookie += `; Max-Age=${opts.maxAge}`;
  }
  
  if (opts.domain) {
    cookie += `; Domain=${opts.domain}`;
  }
  
  if (opts.path) {
    cookie += `; Path=${opts.path}`;
  }
  
  if (opts.secure) {
    cookie += '; Secure';
  }
  
  if (opts.httpOnly) {
    cookie += '; HttpOnly';
  }
  
  // Set SameSite attribute
  // - 'Lax' (default): Cookies are sent in first-party context and in navigation from external sites
  // - 'Strict': Cookies are only sent in first-party context
  // - 'None': Cookies are sent in all contexts, requires Secure attribute
  cookie += `; SameSite=${opts.sameSite}`;
  
  // If SameSite=None (3rd party context), Secure must be true
  if (opts.sameSite === 'None' && !opts.secure) {
    cookie += '; Secure';
  }
  
  // Add Partitioned attribute if needed (CHIPS - Cookies Having Independent Partitioned State)
  // This is a new attribute for cookies that need cross-site functionality but want to be partitioned
  if (opts.partitioned && opts.sameSite === 'None') {
    cookie += '; Partitioned';
  }
  
  // Set the cookie
  document.cookie = cookie;
}

/**
 * Remove a cookie
 * @param name - Cookie name
 * @param options - Cookie options (must match the domain and path used to set the cookie)
 */
export function removeCookie(name: string, options: CookieOptions = {}): void {
  // To remove a cookie, set its expiration date to the past
  setCookie(name, '', {
    ...options,
    maxAge: -1,
    expires: new Date(0),
  });
}

/**
 * Cookie handler for Supabase
 */
export const supabaseCookieHandler = {
  get(name: string): string | undefined {
    return getCookie(name) || undefined;
  },
  
  set(name: string, value: string, options?: CookieOptions): void {
    setCookie(name, value, {
      ...options,
      // Use Lax for first-party cookies (most common case)
      sameSite: 'Lax',
    });
  },
  
  remove(name: string, options?: CookieOptions): void {
    removeCookie(name, options);
  },
};

export default {
  getCookie,
  setCookie,
  removeCookie,
  supabaseCookieHandler,
}; 