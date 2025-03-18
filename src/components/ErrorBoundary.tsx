"use client";

import React, { Component, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNotFound: boolean;
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
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isNotFound: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isNotFound:
        error.message.includes("404") ||
        error.message.toLowerCase().includes("not found"),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      if (this.state.isNotFound) {
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
              <p className="text-gray-400 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleBack} variant="outline">
                  Go Back
                </Button>
                <Button onClick={() => (window.location.href = "/")}>
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We encountered an error while loading this page.
            </p>
            <Button onClick={this.handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
