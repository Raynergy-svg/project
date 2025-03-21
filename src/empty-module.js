/**
 * Empty module to replace missing dependencies in Next.js projects.
 * This is useful for component mocking, especially when migrating 
 * from one framework to another.
 */

// Import React for the component mocks
// Don't use require() as it's not available in browser contexts
import * as React from 'react';
// Fallback in case import doesn't work
const ReactFallback = { createElement: () => null };

// No-op function that can be used as a replacement for useNavigate or similar hooks
export const useNavigate = () => {
  return (path) => {
    console.warn(`Navigation to ${path} not implemented in this context`);
    return null;
  };
};

// Mock for useLocation hook
export const useLocation = () => {
  return {
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null
  };
};

// Mock for Link component
export const Link = ({ to, children, className, ...props }) => {
  if (typeof window !== 'undefined') {
    // Use dynamic import instead of require
    // This will be removed during bundling and replaced with a module reference
    return React.createElement('a', { href: to, className, ...props }, children);
  }
  return null;
};

// Mock for NavLink component
export const NavLink = ({ to, children, className, activeClassName, ...props }) => {
  if (typeof window !== 'undefined') {
    // Use dynamic import instead of require
    return React.createElement('a', { href: to, className, ...props }, children);
  }
  return null;
};

// Mock for Outlet component
export const Outlet = () => {
  return null;
};

// Default export for compatibility
export default {
  useNavigate,
  useLocation,
  Link,
  NavLink,
  Outlet
};
