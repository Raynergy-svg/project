'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { ChunkErrorBoundary } from '@/components/error/ChunkErrorBoundary';

// Import both page versions directly
import StaticAboutPage from './static-page';
import DynamicAboutPage from './dynamic-about';

// Import the chunk error handler utility
import applyChunkErrorHandler from '@/utils/chunk-error-handler';

/**
 * Loading state while the dynamic page is being loaded
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="relative mx-auto">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-primary">Loading About Page</h2>
        <p className="text-muted-foreground">Please wait while we load the content...</p>
      </div>
    </div>
  );
}

/**
 * This is the main About page component that uses ChunkErrorBoundary to handle chunk loading errors.
 * When a chunk loading error occurs, the error boundary's error handler will trigger,
 * but we'll have to manually handle the fallback since ChunkErrorBoundary doesn't accept a fallback prop.
 */
export default function AboutPage() {
  // Apply chunk error handler on the client side
  useEffect(() => {
    applyChunkErrorHandler();
  }, []);

  return (
    <>
      <ChunkErrorBoundary>
        <Suspense fallback={<LoadingState />}>
          <ErrorFallbackWrapper>
            <DynamicAboutPage />
          </ErrorFallbackWrapper>
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}

/**
 * A wrapper component that will render the StaticAboutPage as a fallback
 * if the dynamic page fails to load
 */
function ErrorFallbackWrapper({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleChunkError = (event: Event) => {
      console.warn('Chunk loading error detected, falling back to static version', event);
      setHasError(true);
    };
    
    // Use the custom event from our chunk error handler
    window.addEventListener('chunkLoadError', handleChunkError);

    return () => {
      window.removeEventListener('chunkLoadError', handleChunkError);
    };
  }, []);

  if (hasError) {
    return <StaticAboutPage />;
  }

  return <>{children}</>;
}
