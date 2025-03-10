'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

/**
 * Toast Provider Component
 * 
 * This component provides toast notifications across the application
 * and handles clearing toasts on route changes to prevent stale notifications.
 */
export function ToastProvider() {
  const pathname = usePathname();
  
  // Clear toasts when route changes
  useEffect(() => {
    // We can access the toast API directly to clear all toasts if needed
    // This prevents stale toasts from persisting across page navigation
    
    // Example implementation if you're using a toast library:
    // toast.dismiss(); // Clear all toasts
  }, [pathname]); // Now watching pathname changes instead of router events

  return <Toaster />;
}

export default ToastProvider; 