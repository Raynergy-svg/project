/**
 * Compatibility patch for App Router functionality
 * This is a placeholder to ensure backward compatibility with Pages Router
 */

// Mock router actions
export const useAppRouter = () => {
  console.warn('App Router hooks are not available in Pages Router context');
  return {
    push: () => console.warn('Router push not available'),
    replace: () => console.warn('Router replace not available'),
    back: () => console.warn('Router back not available'),
    prefetch: () => console.warn('Router prefetch not available'),
  };
};

// Mock router state
export const createAppRouterState = () => {
  return {
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    query: {},
    asPath: typeof window !== 'undefined' ? window.location.pathname : '/',
    isFallback: false,
    isReady: true,
  };
};

// Default export
export default {
  useAppRouter,
  createAppRouterState
};
