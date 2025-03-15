'use client';

import React, { Suspense, useEffect, useState } from 'react';
import SectionLoader from '@/components/SectionLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import dynamic from 'next/dynamic';

// This wrapper ensures dynamic imports happen only on the client side
// to avoid the "Cannot read properties of undefined (reading 'call')" error

interface WrapperProps {
  componentName: string;
  fallback?: React.ReactNode;
  props?: any;
}

const ClientWrapper: React.FC<WrapperProps> = ({ componentName, fallback, props }) => {
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're only running on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mapping of component names to their dynamic imports with enhanced error handling
  const componentMap: Record<string, any> = {
    'MethodsSection': dynamic(() => 
      import('@/components/landing/MethodsSection')
        .catch(err => {
          console.error('Error loading MethodsSection:', err);
          setHasError(true);
          return { default: () => <div>Failed to load section</div> };
        })
    ),
    'Features': dynamic(() => 
      import('@/components/landing/Features')
        .catch(err => {
          console.error('Error loading Features:', err);
          setHasError(true);
          return { default: () => <div>Failed to load section</div> };
        })
    ),
    'Pricing': dynamic(() => 
      import('@/components/landing/Pricing')
        .catch(err => {
          console.error('Error loading Pricing:', err);
          setHasError(true);
          return { default: () => <div>Failed to load section</div> };
        })
    ),
    'Testimonials': dynamic(() => 
      import('@/components/landing/Testimonials')
        .catch(err => {
          console.error('Error loading Testimonials:', err);
          setHasError(true);
          return { default: () => <div>Failed to load section</div> };
        })
    ),
  };

  // Handle server-side rendering safely
  if (!isClient) {
    return fallback || <SectionLoader />;
  }

  // Handle errors in component mapping
  if (hasError) {
    return (
      <div className="py-8 text-center">
        <p>We're having trouble loading this section. Please try refreshing the page.</p>
      </div>
    );
  }

  const DynamicComponent = componentMap[componentName];

  if (!DynamicComponent) {
    console.error(`Component "${componentName}" not found in the component map`);
    return <div>Component not found</div>;
  }

  // Wrap in try-catch for additional safety
  try {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || <SectionLoader />}>
          <DynamicComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error(`Error rendering ${componentName}:`, error);
    return (
      <div className="py-8 text-center">
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }
};

export default ClientWrapper; 