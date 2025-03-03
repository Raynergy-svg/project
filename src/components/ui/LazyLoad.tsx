import React, { useState, useRef, useEffect, FC, ReactNode, Suspense } from 'react';
import { Skeleton } from './Skeleton';

interface LazyLoadProps {
  children: ReactNode;
  height?: string | number;
  width?: string | number;
  threshold?: number;
  className?: string;
  fallback?: ReactNode;
  skeletonVariant?: 'default' | 'card' | 'text' | 'circular' | 'chart';
}

/**
 * LazyLoad component that only renders its children when they become visible in the viewport
 * Uses IntersectionObserver for efficient visibility detection
 */
export const LazyLoad: FC<LazyLoadProps> = ({
  children,
  height,
  width,
  threshold = 0.1,
  className = '',
  fallback,
  skeletonVariant = 'default',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once component is visible, we can stop observing
          observer.unobserve(currentRef);
        }
      },
      { threshold }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);
  
  // Default fallback if none provided
  const defaultFallback = <Skeleton 
    variant={skeletonVariant} 
    width={width} 
    height={height} 
  />;

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ 
        height: !isVisible ? height : undefined, 
        width: !isVisible ? width : undefined
      }}
    >
      {(isVisible || hasBeenVisible) ? children : (fallback || defaultFallback)}
    </div>
  );
};

/**
 * LazyLoadSuspense combines LazyLoad with React's Suspense
 * for components that need to load data or code-split modules
 */
export const LazyLoadSuspense: FC<LazyLoadProps> = (props) => {
  return (
    <LazyLoad {...props}>
      <Suspense fallback={props.fallback || <Skeleton 
        variant={props.skeletonVariant} 
        width={props.width} 
        height={props.height} 
      />}>
        {props.children}
      </Suspense>
    </LazyLoad>
  );
}; 