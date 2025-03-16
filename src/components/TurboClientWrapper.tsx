"use client";

import React, { useState, useEffect, Suspense } from "react";

interface TurboClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: boolean;
}

/**
 * TurboClientWrapper
 *
 * An optimized client component wrapper specifically designed for Turbopack.
 * This component helps prevent React Server Components hydration issues
 * and ensures proper loading with Turbopack.
 *
 * @example
 * <TurboClientWrapper priority>
 *   <ComponentWithPotentialTurboIssues />
 * </TurboClientWrapper>
 */
export default function TurboClientWrapper({
  children,
  fallback = <div className="min-h-[20px] animate-pulse">Loading...</div>,
  priority = false,
}: TurboClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Apply immediate mounting for priority components
    if (priority) {
      setIsMounted(true);
      return;
    }

    // For non-priority components, use a delay to ensure
    // Turbopack has fully processed everything
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [priority]);

  // Use Suspense for better Turbopack streaming
  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}
