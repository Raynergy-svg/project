"use client";

// Reference the webpack type declarations
/// <reference path="../types/webpack.d.ts" />

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Define the WebpackRequire interface here for explicit access
interface WebpackRequire {
  (moduleId: any): any;
  m: Record<string, any>;
  c: Record<string, any>;
  p: string;
  n: (moduleId: any) => any;
  o: (object: any, property: string) => boolean;
  d: (exports: any, name: string, getter: () => any) => void;
  r: (exports: any) => void;
  t: (value: any, mode: string) => any;
  nmd: (module: any) => any;
  f: {
    j: (chunkId: any) => Promise<void>;
    [key: string]: any;
  };
  e: (chunkId: any) => Promise<void>;
  u: (chunkId: any) => string;
  g: any;
  h: () => string;
  S: Record<string, any>;
  [key: string]: any;
}

interface ClientWebpackErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Integrated WebpackErrorHandler component
 * Now with direct implementation to avoid dynamic import chunks
 */
export default function ClientWebpackErrorHandler({
  children,
}: ClientWebpackErrorHandlerProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // This effect will run only on the client
  useEffect(() => {
    // Flag that we're on the client
    setIsClient(true);
  }, []);

  // Fix React Server Components client error
  useEffect(() => {
    // Early return if not in browser
    if (typeof window === "undefined") return;

    // Apply patches to react-server-dom-webpack
    const patchReactServerDOMWebpack = () => {
      try {
        // Get all script elements that might contain the problematic module
        const scripts = document.querySelectorAll("script");

        // Find the webpack runtime script
        const webpackScript = Array.from(scripts).find(
          (script) => script.src && script.src.includes("webpack.js")
        );

        if (webpackScript) {
          // Enhance the webpack require function
          const webpackRequire = window.__webpack_require__;
          if (webpackRequire) {
            const originalRequire = webpackRequire;

            // Create a proxy function that maintains all the required properties of WebpackRequire
            const patchedRequire = function(moduleId: any) {
              try {
                if (moduleId === undefined || moduleId === null) {
                  console.warn("Attempted to require undefined module");
                  return {};
                }
                return originalRequire(moduleId);
              } catch (e) {
                console.warn(`Error requiring module ${moduleId}:`, e);
                return {};
              }
            } as WebpackRequire;

            // Copy all properties from the original require
            for (const key in originalRequire) {
              if (Object.prototype.hasOwnProperty.call(originalRequire, key)) {
                patchedRequire[key] = originalRequire[key];
              }
            }
            
            // Assign back to window
            window.__webpack_require__ = patchedRequire;
          }
        }
      } catch (e) {
        console.warn("Error patching React Server DOM Webpack:", e);
      }
    };

    // Apply patch immediately
    patchReactServerDOMWebpack();

    // Also patch after a short delay in case scripts load later
    setTimeout(patchReactServerDOMWebpack, 500);
  }, []);

  useEffect(() => {
    // Handle global errors
    function handleError(event: ErrorEvent) {
      const isRSCError =
        (event.message &&
          (event.message.includes("Cannot read properties of undefined") ||
            event.message.includes("reading 'call'") ||
            event.message.includes("react-server-dom-webpack"))) ||
        (event.error &&
          event.error.stack &&
          (event.error.stack.includes("react-server-dom-webpack") ||
            event.error.stack.includes("webpack.js")));

      if (isRSCError) {
        console.error("RSC Error caught:", event.message);
        event.preventDefault();
        setHasError(true);
        setErrorDetails(event.message);
      }
    }

    // Handle promise rejections
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason ? String(event.reason) : "";
      const isRSCError =
        reason.includes("Cannot read properties of undefined") ||
        reason.includes("reading 'call'") ||
        reason.includes("react-server-dom-webpack");

      if (isRSCError) {
        console.error("RSC Promise Rejection caught:", reason);
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
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleRejection);
      }
    };
  }, []);

  // Handle retry
  function handleRetry() {
    // Reset error state
    setHasError(false);
    setErrorDetails(null);

    // Force refresh the page
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  // On the server or during initial hydration, just render children
  if (!isClient) {
    return <>{children}</>;
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
          temporary problem with React Server Components.
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
            onClick={() => {
              window.location.reload();
            }}
            className="w-full"
          >
            Reload Page
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              // Clear storage and cache
              if ("caches" in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full mt-2"
          >
            Clear Cache and Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
