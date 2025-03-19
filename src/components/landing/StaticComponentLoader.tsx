'use client';

import React, { useState, useEffect } from 'react';
import SectionLoader from '@/components/SectionLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import ClientErrorFallback from '@/components/ClientErrorFallback';

// Direct imports instead of dynamic imports
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import MethodsSection from '@/components/landing/MethodsSection';

interface StaticComponentLoaderProps {
  componentName: string;
  props?: any;
}

/**
 * A static component loader that directly imports landing components
 * to avoid chunk loading errors
 */
export default function StaticComponentLoader({
  componentName,
  props = {},
}: StaticComponentLoaderProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Ensure we're only running on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle server-side rendering safely
  if (!isClient) {
    return <SectionLoader />;
  }

  try {
    // Use a switch statement to render the correct component
    switch (componentName) {
      case 'Features':
        return (
          <ErrorBoundary>
            {/* Using try-catch instead of fallback prop since ErrorBoundary doesn't support it */}
            <Features {...props} />
          </ErrorBoundary>
        );
      
      case 'Pricing':
        return (
          <ErrorBoundary>
            <Pricing {...props} />
          </ErrorBoundary>
        );
        
      case 'Testimonials':
        return (
          <ErrorBoundary>
            <Testimonials {...props} />
          </ErrorBoundary>
        );
        
      case 'MethodsSection':
        return (
          <ErrorBoundary>
            <MethodsSection {...props} />
          </ErrorBoundary>
        );
      
      default:
        return <ClientErrorFallback componentName={componentName} />;
    }
  } catch (error) {
    console.error(`Error rendering ${componentName}:`, error);
    return <ClientErrorFallback componentName={componentName} />;
  }
}
