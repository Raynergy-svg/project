import { useState, useEffect } from 'react';

/**
 * Hook for responsive design with media queries
 * 
 * This hook allows components to respond to changes in media queries.
 * It's particularly useful for implementing responsive design features.
 * 
 * @param query The media query to check, e.g. '(max-width: 768px)'
 * @returns A boolean indicating whether the query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    // Avoid memory leaks by just not setting up listeners during SSR
    if (typeof window === 'undefined') return undefined;
    
    const matchMedia = window.matchMedia(query);
    
    // Handle change event
    const handleChange = () => {
      setMatches(matchMedia.matches);
    };
    
    // Set up listeners and call once immediately for initial state
    if (matchMedia.addEventListener) {
      // Modern browsers
      matchMedia.addEventListener('change', handleChange);
    } else {
      // Older browsers
      matchMedia.addListener(handleChange);
    }
    
    // Set initial value
    handleChange();
    
    // Clean up
    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handleChange);
      } else {
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery; 