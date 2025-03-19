'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ChunkErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * ChunkErrorBoundary - Catches and handles webpack chunk loading errors
 * This component attaches event listeners for chunk loading errors and provides
 * fallback UI when they occur
 */
export function ChunkErrorBoundary({ children }: ChunkErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ chunkId?: string; message: string }>({
    message: 'An error occurred loading this page'
  });
  
  const router = useRouter();

  // Add global handlers for chunk loading errors
  useEffect(() => {
    // Handler for the custom chunkLoadError event
    const handleChunkError = (event: CustomEvent) => {
      console.error('Chunk loading error detected:', event.detail);
      setErrorDetails({
        chunkId: event.detail.chunkId,
        message: `Failed to load page chunk: ${event.detail.chunkId || 'unknown'}`
      });
      setHasError(true);
    };

    // Global error handler for unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      // Only catch chunk loading errors
      if (event.message && (
        event.message.includes('Loading chunk') || 
        event.message.includes('Unexpected token') ||
        event.message.includes('Failed to fetch dynamically imported module')
      )) {
        console.error('Global chunk error:', event);
        setErrorDetails({
          message: 'Failed to load page content'
        });
        setHasError(true);
        
        // Prevent the error from showing in the console
        event.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener('chunkLoadError', handleChunkError as EventListener);
    window.addEventListener('error', handleGlobalError);

    // Clean up
    return () => {
      window.removeEventListener('chunkLoadError', handleChunkError as EventListener);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Handle retry
  const handleRetry = () => {
    setHasError(false);
    // Force a refresh of the page
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-lg bg-muted/30 shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Page Loading Error</h2>
          <p className="text-muted-foreground mb-6">
            {errorDetails.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleRetry} 
              variant="default" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
