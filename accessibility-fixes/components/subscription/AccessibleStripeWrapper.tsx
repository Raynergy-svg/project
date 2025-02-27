import React, { useRef, useEffect } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AccessibleStripeWrapperProps {
  isLoading?: boolean;
  id: string;
  className?: string;
  loadingText?: string;
  children: React.ReactNode;
}

/**
 * An accessible wrapper for Stripe elements that ensures proper accessibility
 * by managing aria-attributes correctly and avoiding the common issue of
 * having focusable elements inside aria-hidden containers.
 */
export function AccessibleStripeWrapper({
  isLoading = false,
  id,
  className = '',
  loadingText = 'Loading payment form...',
  children
}: AccessibleStripeWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Monitor for accessibility issues and fix them
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Function to fix Stripe iframes that might have accessibility issues
    const fixStripeAccessibility = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // Find any elements with aria-hidden="true" that contain focusable elements
      const ariaHiddenElements = wrapper.querySelectorAll('[aria-hidden="true"]');
      ariaHiddenElements.forEach(element => {
        // Check if this element contains any focusable elements
        const focusableElements = element.querySelectorAll(
          'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          // Fix: Remove aria-hidden from parent and add proper labelling
          element.removeAttribute('aria-hidden');
          
          // If the element didn't have an accessible name, add one
          if (!element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', 'Payment form');
          }
        }
      });
    };

    // Initial fix
    fixStripeAccessibility();

    // Set up a mutation observer to monitor for DOM changes
    const observer = new MutationObserver(fixStripeAccessibility);
    observer.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden']
    });

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  return (
    <div 
      id={id}
      ref={wrapperRef}
      className={`stripe-element-wrapper ${className}`}
      data-testid="stripe-wrapper"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <LoadingSpinner size="md" />
          <span className="text-sm text-gray-400">{loadingText}</span>
        </div>
      ) : (
        <div className="stripe-element-container">
          {children}
        </div>
      )}
    </div>
  );
} 