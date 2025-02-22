import { useState, useEffect } from 'react';

export type PerformanceLevel = 'high' | 'medium' | 'low';

export interface DeviceContext {
  isMobile: boolean;
  isTouch: boolean;
  performanceLevel: PerformanceLevel;
}

const checkPerformanceLevel = (): PerformanceLevel => {
  const cores = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || 4;

  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
};

export const useDeviceContext = (): DeviceContext => {
  const [context, setContext] = useState<DeviceContext>({
    isMobile: false,
    isTouch: false,
    performanceLevel: 'medium'
  });

  useEffect(() => {
    const updateContext = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0;
      const performanceLevel = checkPerformanceLevel();

      setContext({ isMobile, isTouch, performanceLevel });
    };

    // Initial check
    updateContext();

    // Listen for resize events
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = () => updateContext();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return context;
}; 