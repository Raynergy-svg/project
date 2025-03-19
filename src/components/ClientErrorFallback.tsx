'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ClientErrorFallbackProps {
  componentName?: string;
  onRetry?: () => void;
}

/**
 * A client-side fallback component that's shown when chunk loading fails
 * particularly useful for handling 404 errors from dynamic imports
 */
export default function ClientErrorFallback({
  componentName = 'Component',
  onRetry,
}: ClientErrorFallbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen for chunk load errors
    const handleChunkError = (event: Event) => {
      const customEvent = event as CustomEvent<{chunkId: string; error: Error}>;
      console.log('Chunk load error detected:', customEvent.detail);
      setVisible(true);
    };

    window.addEventListener('chunkLoadError', handleChunkError);
    
    // Show component after a short delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => {
      window.removeEventListener('chunkLoadError', handleChunkError);
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  const handleAlternative = () => {
    // Navigate to dashboard as a fallback
    window.location.href = '/dashboard';
  };

  if (!visible) {
    return <div className="p-4 animate-pulse">Loading...</div>;
  }

  return (
    <Alert variant="destructive" className="my-4 max-w-2xl mx-auto">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Loading {componentName}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          We couldn't load this component. This might be due to a temporary network issue or a missing resource.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" onClick={handleRetry}>
            Try Again
          </Button>
          <Button variant="outline" onClick={handleAlternative}>
            Go to Dashboard
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
