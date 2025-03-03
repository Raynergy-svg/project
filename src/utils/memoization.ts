import { useMemo, useCallback, useState, useEffect, useRef } from 'react';

/**
 * Custom hook for memoizing expensive calculations with dependency tracking
 * @param calculationFn The expensive calculation function to memoize
 * @param dependencies Array of dependencies that should trigger recalculation
 * @param options Optional configuration
 * @returns The memoized calculation result
 */
export function useCalculation<T>(
  calculationFn: () => T,
  dependencies: React.DependencyList,
  options: {
    debugLabel?: string;
    logPerformance?: boolean;
  } = {}
): T {
  const { debugLabel, logPerformance } = options;
  
  // Use ref to track execution time without causing re-renders
  const perfRef = useRef({
    startTime: 0,
    endTime: 0,
    executionCount: 0
  });
  
  return useMemo(() => {
    if (logPerformance) {
      perfRef.current.startTime = performance.now();
      perfRef.current.executionCount++;
    }
    
    // Run the calculation
    const result = calculationFn();
    
    if (logPerformance) {
      perfRef.current.endTime = performance.now();
      const executionTime = perfRef.current.endTime - perfRef.current.startTime;
      console.log(
        `[useCalculation${debugLabel ? ` - ${debugLabel}` : ''}] ` +
        `Execution #${perfRef.current.executionCount} took ${executionTime.toFixed(2)}ms`
      );
    }
    
    return result;
  }, dependencies);
}

/**
 * Creates a debounced version of a value that only updates after a delay
 * Useful for values that change rapidly but should only trigger expensive operations infrequently
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Creates a throttled version of a callback function that can only be invoked
 * once per specified time period
 * 
 * @param callback The function to throttle
 * @param delay The minimum time between invocations in milliseconds
 * @returns The throttled function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const lastCalledRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCalledRef.current;
    
    if (timeSinceLastCall >= delay) {
      // It's been longer than the delay since the last call, so call immediately
      lastCalledRef.current = now;
      return callbackRef.current(...args);
    } else {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule a call after the remaining delay
      return new Promise<ReturnType<T>>((resolve) => {
        const remainingDelay = delay - timeSinceLastCall;
        
        timeoutRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          const result = callbackRef.current(...args);
          resolve(result);
          timeoutRef.current = null;
        }, remainingDelay);
      });
    }
  }, [delay]);
}

/**
 * Creates a memoized selector function that only recomputes
 * when dependencies change
 * 
 * @param selector Selector function that computes derived state
 * @param dependencies Dependencies array
 * @returns Memoized selector result
 */
export function useSelector<T, D extends React.DependencyList>(
  selector: () => T,
  dependencies: D
): T {
  return useMemo(() => selector(), dependencies);
}

/**
 * Creates a stable reference to a value that doesn't change
 * identity between renders (useful for non-primitive deps)
 * 
 * @param value The value to stabilize
 * @param equals Optional equality function (deep comparison by default)
 * @returns A stable reference to the value
 */
export function useStableValue<T>(
  value: T,
  equals: (prev: T, next: T) => boolean = deepEquals
): T {
  const ref = useRef(value);
  
  if (!equals(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

// Simple deep equality comparison
function deepEquals(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (
    a === null || b === null ||
    typeof a !== 'object' || typeof b !== 'object'
  ) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  return keysA.every(key => {
    return keysB.includes(key) && deepEquals(a[key], b[key]);
  });
} 