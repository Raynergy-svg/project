"use client";

// Reference the webpack type declarations
/// <reference path="../types/webpack.d.ts" />

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Add declaration for webpack globals directly in this file
declare global {
  interface Window {
    __webpack_require__?: {
      (moduleId: any): any;
      [key: string]: any;
    };
  }
}

interface WebpackErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * WebpackErrorHandler
 *
 * A specialized error boundary component that specifically targets and handles
 * webpack-related errors, including the "Cannot read properties of undefined (reading 'call')" error.
 *
 * This component:
 * 1. Listens for global errors that match webpack patterns
 * 2. Provides a user-friendly fallback UI when errors occur
 * 3. Offers a retry mechanism
 */
const WebpackErrorHandler: React.FC<WebpackErrorHandlerProps> = ({
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(function () {
    // Function to handle global errors
    function handleError(event: ErrorEvent) {
      // Check if this is a webpack-related error using indexOf instead of includes
      const isWebpackError =
        event.message.indexOf("webpack") !== -1 ||
        event.message.indexOf("Cannot read properties of undefined") !== -1 ||
        event.message.indexOf("reading 'call'") !== -1 ||
        (event.error &&
          event.error.stack &&
          event.error.stack.indexOf("webpack") !== -1);

      if (isWebpackError) {
        // Prevent the error from bubbling up
        event.preventDefault();
        setHasError(true);
        setErrorDetails(event.message);
      }
    }

    // Function to handle promise rejections
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason ? String(event.reason) : "";
      const isWebpackError =
        reason.indexOf("webpack") !== -1 ||
        reason.indexOf("Cannot read properties of undefined") !== -1 ||
        reason.indexOf("reading 'call'") !== -1;

      if (isWebpackError) {
        // Prevent the rejection from bubbling up
        event.preventDefault();
        setHasError(true);
        setErrorDetails(reason);
      }
    }

    // Add event listeners
    if (typeof window !== "undefined") {
      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", handleRejection);
    }

    // Cleanup
    return function () {
      if (typeof window !== "undefined") {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleRejection);
      }
    };
  }, []);

  // Function to handle retry
  function handleRetry() {
    // Apply webpack patch again
    try {
      // Try to fix webpack runtime issues
      if (typeof window !== "undefined" && window.__webpack_require__) {
        var originalRequire = window.__webpack_require__;

        window.__webpack_require__ = function patchedRequire(moduleId: any) {
          try {
            if (!moduleId) {
              return {};
            }
            return originalRequire(moduleId);
          } catch (e) {
            return {};
          }
        };
      }
    } catch (e) {
      // Ignore errors in the patch itself
    }

    // Reset error state
    setHasError(false);
    setErrorDetails(null);
  }

  // If no error, render children normally
  if (!hasError) {
    return <>{children}</>;
  }

  // Error fallback UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Something went wrong
        </h2>
        <p className="mb-4 text-muted-foreground">
          We encountered an issue loading this page. This is likely due to a
          temporary problem with the application's resources.
        </p>
        {errorDetails && (
          <div className="mb-4 p-3 bg-muted rounded text-sm overflow-auto max-h-32">
            <code>{errorDetails}</code>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={function () {
              window.location.reload();
            }}
            className="w-full"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebpackErrorHandler;
