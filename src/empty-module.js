/**
 * Empty module to replace missing dependencies in Next.js projects.
 * This is useful for component mocking, especially when migrating 
 * from one framework to another.
 */

// Import React for the component mocks
const React = typeof window !== 'undefined' ? require('react') : { createElement: () => null };

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
    const NextLink = require('next/link').default;
    return React.createElement(NextLink, { href: to, className, ...props }, children);
  }
  return null;
};

// Mock for NavLink component
export const NavLink = ({ to, children, className, activeClassName, ...props }) => {
  if (typeof window !== 'undefined') {
    const NextLink = require('next/link').default;
    return React.createElement(NextLink, { href: to, className, ...props }, children);
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
