/**
 * Navigation utilities for handling route verification and navigation
 */

// Known valid routes in the application
const KNOWN_ROUTES = [
  "/",
  "/about",
  "/features", 
  "/pricing",
  "/contact",
  "/blog",
  "/blog/archive",
  "/careers",
  "/help",
  "/docs",
  "/status",
  "/privacy",
  "/terms",
  "/security",
  "/faq",
  "/dashboard",
  "/signin",
  "/signup",
  "/auth/signin",
  "/auth/signup",
];

/**
 * Check if a given path is a known valid route
 * @param path - The path to check
 * @returns true if the path is a known route, false otherwise
 */
export const isValidRoute = (path: string): boolean => {
  // Check direct matches
  if (KNOWN_ROUTES.includes(path)) {
    return true;
  }
  
  // Check for blog post routes (e.g. /blog/some-post-slug)
  if (path.match(/^\/blog\/[^\/]+$/)) {
    return true;
  }
  
  // Check for dashboard routes
  if (path.startsWith('/dashboard/')) {
    return true;
  }
  
  // Check for help article routes
  if (path.startsWith('/help/')) {
    return true;
  }
  
  // Check for docs routes
  if (path.startsWith('/docs/')) {
    return true;
  }
  
  return false;
};

/**
 * Navigate to a path, with fallback to home page if invalid
 * @param path - The path to navigate to
 */
export const safeNavigate = (path: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  if (isValidRoute(path)) {
    // If it's a valid route, use normal navigation
    window.location.href = path;
  } else {
    // If it's an invalid route, go to home page
    console.warn(`Attempted to navigate to invalid route: ${path}`);
    window.location.href = '/';
  }
};
