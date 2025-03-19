'use client';

/**
 * Empty module to replace missing dependencies in Next.js projects - browser version.
 * This is specifically designed to work in client-side contexts without using require().
 */

import * as React from 'react';

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
  return React.createElement('a', { href: to, className, ...props }, children);
};

// Mock for NavLink component
export const NavLink = ({ to, children, className, activeClassName, ...props }) => {
  return React.createElement('a', { href: to, className, ...props }, children);
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
