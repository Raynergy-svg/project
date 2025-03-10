'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for Next.js
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component
 * tree that crashed.
 * 
 * Note: Error boundaries do not catch errors in:
 * - Event handlers
 * - Asynchronous code (e.g. setTimeout or requestAnimationFrame callbacks)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Here you could send the error to your analytics or error tracking service
    // Example: sendToAnalytics(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default fallback UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
          <div className="mb-4 rounded-full bg-muted p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Something went wrong</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={this.resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/" passHref>
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 max-w-md overflow-auto rounded border bg-muted p-4 text-left">
              <p className="mb-2 font-medium">Error details (development only):</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
