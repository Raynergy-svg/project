import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint configuration for responsive design
 * Follows Tailwind CSS default breakpoints
 */
export const breakpoints = {
  xs: 320,  // Mobile portrait
  sm: 481,  // Mobile landscape
  md: 769,  // Tablet portrait
  lg: 1025, // Tablet landscape/small laptop
  xl: 1281, // Desktop
  '2xl': 1537 // Large desktop
} as const;

type Breakpoint = keyof typeof breakpoints;

interface BreakpointState {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  isSmAndUp: boolean;
  isMdAndUp: boolean;
  isLgAndUp: boolean;
  isXlAndUp: boolean;
}

/**
 * Hook for responsive design breakpoint detection
 * Provides current breakpoint and helper flags for conditional rendering
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { isMobile, isTablet, isDesktop } = useBreakpoint();
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : breakpoints.xs;
    const height = typeof window !== 'undefined' ? window.innerHeight : 600;
    const breakpoint = getBreakpointFromWidth(width);
    
    return {
      breakpoint,
      width,
      height,
      ...getBreakpointFlags(breakpoint)
    };
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpointFromWidth(width);

    setState(prev => {
      // Only update if dimensions actually changed
      if (prev.width === width && prev.height === height) {
        return prev;
      }

      // Log breakpoint changes in development
      if (
        import.meta.env.DEV && 
        prev.breakpoint !== breakpoint
      ) {
        console.log(`Breakpoint changed: ${prev.breakpoint} -> ${breakpoint}`);
        console.log(`Viewport: ${width}x${height}`);
      }

      return {
        breakpoint,
        width,
        height,
        ...getBreakpointFlags(breakpoint)
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleResize, 100);
    };

    // Initial check
    handleResize();

    // Add event listener with passive flag for better performance
    window.addEventListener('resize', debouncedResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [handleResize]);

  return state;
}

// Helper functions
function getBreakpointFromWidth(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

function getBreakpointFlags(breakpoint: Breakpoint) {
  return {
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isSmAndUp: ['sm', 'md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isMdAndUp: ['md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isLgAndUp: ['lg', 'xl', '2xl'].includes(breakpoint),
    isXlAndUp: ['xl', '2xl'].includes(breakpoint),
  };
}