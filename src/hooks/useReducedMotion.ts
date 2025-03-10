import { useEffect, useState } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * 
 * This hook checks the user's system preference for reduced motion.
 * It's useful for implementing accessible animations that respect user preferences.
 * 
 * @returns A boolean indicating whether the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  // Default to false to ensure animations run by default
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check for the prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set the initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Add a listener to update the value when the preference changes
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    // Use the appropriate event listener method
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  return prefersReducedMotion;
}

export default useReducedMotion;