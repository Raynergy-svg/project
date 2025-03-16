"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import the WebpackErrorHandler with SSR disabled
const WebpackErrorHandler = dynamic(
  () => import("@/components/WebpackErrorHandler"),
  { ssr: false }
);

interface ClientWebpackErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Robust client-side wrapper for WebpackErrorHandler
 * that ensures it only runs on the client and provides proper fallback
 */
export default function ClientWebpackErrorHandler({
  children,
}: ClientWebpackErrorHandlerProps) {
  const [isClient, setIsClient] = useState(false);
  const [renderTimeout, setRenderTimeout] = useState(false);

  // This effect will run only on the client
  useEffect(() => {
    // Flag that we're on the client
    setIsClient(true);

    // Set a timeout to handle slow loading
    const timer = setTimeout(() => {
      setRenderTimeout(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Pre-render patch for webpack
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Apply global patches to help prevent React Server Components errors
      try {
        // Add a patch to window.__webpack_require__ if it exists
        // This is a defensive programming measure for client-side webpack issues
        const originalRequire = window.__webpack_require__;
        if (originalRequire) {
          window.__webpack_require__ = function patchedRequire(moduleId: any) {
            try {
              // Safely handle undefined modules
              if (moduleId == null) return {};
              return originalRequire(moduleId);
            } catch (e) {
              // Return an empty object instead of crashing
              console.warn(`Error requiring module ${moduleId}:`, e);
              return {};
            }
          };

          // Preserve original properties
          Object.keys(originalRequire).forEach((key) => {
            window.__webpack_require__[key] = originalRequire[key];
          });
        }
      } catch (e) {
        console.warn("Error applying pre-render webpack patches:", e);
      }
    }
  }, []);

  // On the server or during initial hydration, just render children
  if (!isClient) {
    return <>{children}</>;
  }

  // If the dynamic import takes too long, render children directly
  if (renderTimeout) {
    return <>{children}</>;
  }

  // Once on the client, render with the error handler
  return <WebpackErrorHandler>{children}</WebpackErrorHandler>;
}
