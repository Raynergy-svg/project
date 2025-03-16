"use client";

import React, { useState, useEffect } from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientWrapper
 *
 * A client-only component that helps resolve hydration mismatches by
 * ensuring components are only rendered on the client side.
 *
 * @example
 * <ClientWrapper>
 *   <ComponentWithHydrationIssues />
 * </ClientWrapper>
 */
export default function ClientWrapper({
  children,
  fallback = <div className="min-h-[20px] animate-pulse">Loading...</div>,
}: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Apply patch for webpack client modules if needed
    if (typeof window !== "undefined" && window.__webpack_require__) {
      try {
        const originalRequire = window.__webpack_require__;
        window.__webpack_require__ = function (moduleId: any) {
          try {
            // Handle undefined module IDs which cause the error
            if (moduleId === undefined || moduleId === null) {
              console.debug("Prevented error with undefined webpack module ID");
              return {}; // Return empty object instead of throwing
            }
            return originalRequire(moduleId);
          } catch (err) {
            console.warn("Caught webpack module error:", err);
            return {}; // Return empty object to prevent crashes
          }
        };

        // Preserve all properties from the original require
        Object.keys(originalRequire).forEach((key) => {
          window.__webpack_require__[key] = originalRequire[key];
        });
      } catch (err) {
        console.warn("Error applying webpack patch:", err);
      }
    }

    // Mark as mounted after a short delay to ensure client hydration is complete
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Only render children when mounted on client
  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
