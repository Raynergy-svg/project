import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Options for lazy loading components
 */
interface LazyLoadOptions {
  /**
   * Retry count for failed imports
   */
  retry?: number;
  /**
   * Delay between retries in milliseconds
   */
  retryDelay?: number;
  /**
   * Callback function when loading fails
   */
  onError?: (error: Error) => void;
  /**
   * Minimum display time for loading state in milliseconds
   */
  minimumLoadTime?: number;
}

/**
 * Enhanced lazy loading utility with retry logic and error handling
 * 
 * @param importFn Function that returns a promise of a module with a default export
 * @param options Configuration options
 * @returns LazyExoticComponent that will render the component when loaded
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    retry = 2,
    retryDelay = 1500,
    onError,
    minimumLoadTime = 0
  } = options;

  return lazy(() => {
    let retryCount = 0;
    const startTime = Date.now();
    
    const load = async (): Promise<{ default: T }> => {
      try {
        const result = await importFn();
        
        // Handle minimum loading time if specified
        if (minimumLoadTime > 0) {
          const elapsed = Date.now() - startTime;
          if (elapsed < minimumLoadTime) {
            await new Promise(resolve => setTimeout(resolve, minimumLoadTime - elapsed));
          }
        }
        
        return result;
      } catch (error) {
        if (error instanceof Error) {
          // Log the error to console
          console.error(`Error loading component: ${error.message}`);
          
          // Call the error callback if provided
          if (onError) {
            onError(error);
          }
          
          // Retry loading if we haven't exceeded the retry count
          if (retryCount < retry) {
            retryCount++;
            console.log(`Retrying component load (${retryCount}/${retry})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return load();
          }
        }
        
        // Create a fallback component
        return {
          default: (() => {
            const ErrorComponent = () => (
              <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                <h3 className="text-lg font-medium mb-2">Failed to load component</h3>
                <p className="text-sm">
                  The component could not be loaded. Please try refreshing the page.
                </p>
              </div>
            ) as unknown as T;
            
            return ErrorComponent;
          })()
        };
      }
    };
    
    return load();
  });
}

/**
 * Create a lazy loaded component bundle where component is loaded
 * only when it's needed based on a condition
 * 
 * @param importFn Function that returns a promise of a module with a default export
 * @param condition Function that returns a boolean indicating if the component should be loaded
 * @param options Configuration options
 * @returns The component or null if the condition is not met
 */
export function createConditionalComponent<T extends ComponentType<any>, P>(
  importFn: () => Promise<{ default: T }>,
  condition: (props: P) => boolean,
  options: LazyLoadOptions = {}
) {
  // Using the lazyLoad utility to create the lazy component
  const LazyComponent = lazyLoad(importFn, options);
  
  // Return a new component that conditionally renders the lazy component
  return function ConditionalComponent(props: P & JSX.IntrinsicAttributes) {
    return condition(props) ? <LazyComponent {...props} /> : null;
  };
}

/**
 * Preloads a component so it's ready when needed
 * 
 * @param importFn Function that returns a promise of a module with a default export
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  // Start the import but don't wait for it
  importFn().catch(error => {
    console.warn('Error preloading component:', error);
  });
}

/**
 * Preloads multiple components in parallel
 * 
 * @param importFns Array of functions that return promises of modules with default exports
 */
export function preloadComponents(
  importFns: Array<() => Promise<{ default: any }>>
): void {
  importFns.forEach(preloadComponent);
} 