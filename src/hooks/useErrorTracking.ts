import { useEffect } from 'react';

interface ErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: number;
}

export function useErrorTracking() {
  useEffect(() => {
    const errorQueue: ErrorEvent[] = [];
    let isProcessing = false;

    const processErrorQueue = async () => {
      if (isProcessing || errorQueue.length === 0) return;

      isProcessing = true;
      const error = errorQueue.shift();

      if (error) {
        try {
          // Here you would typically send to your error tracking service
          console.log('Error tracked:', error);
          
          // Example implementation for sending to an API
          // await fetch('/api/error-tracking', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(error)
          // });
        } catch (e) {
          console.error('Failed to process error:', e);
        }
      }

      isProcessing = false;
      if (errorQueue.length > 0) {
        processErrorQueue();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const errorEvent = {
        message: event.message,
        source: event.source,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: Date.now()
      };

      errorQueue.push(errorEvent);
      processErrorQueue();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorEvent = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        timestamp: Date.now()
      };

      errorQueue.push(errorEvent);
      processErrorQueue();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}