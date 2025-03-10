import { useEffect, useLayoutEffect, useState } from 'react';

/**
 * A safe version of useLayoutEffect that falls back to useEffect during SSR
 * This prevents the "useLayoutEffect does nothing on the server" warning
 */
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * A component that only renders its children on the client
 * Use this to wrap components that use browser APIs, like useLayoutEffect
 */
export const ClientOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted ? children : fallback;
}; 