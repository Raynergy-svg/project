"use client";

/**
 * This file contains reusable components for redirecting from Pages Router to App Router
 * It helps maintain compatibility during migration and ensures proper redirection
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import from App Router navigation

interface RedirectProps {
  to: string;
  title?: string;
  description?: string;
}

/**
 * Reusable component for redirecting to App Router pages
 * Shows a loading UI while redirecting
 */
export const PageRedirect: React.FC<RedirectProps> = ({ 
  to, 
  title = 'Redirecting...',
  description = 'Please wait while we redirect you to the updated page.'
}) => {
  const router = useRouter();
  
  useEffect(() => {
    // Use App Router navigation
    router.push(to);
    // No timeout fallback - App Router navigation should be reliable
  }, [router, to]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">{title}</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>
        <div className="w-full max-w-md mx-auto">
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-1/2 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          If you are not redirected automatically, please{' '}
          <a href={to} className="text-blue-500 hover:text-blue-700">
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

/**
 * For use in Pages Router files to indicate they have been deprecated
 * This allows for easy tracking of which pages have been migrated
 */
export const createLegacyRedirect = (targetPath: string) => {
  return function LegacyRedirect() {
    const router = useRouter();
    
    useEffect(() => {
      // Add a small delay to avoid issues with the redirect
      const redirectTimer = setTimeout(() => {
        window.location.href = targetPath;
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Redirecting to new page...</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            This page has been migrated to the new App Router.
          </p>
          <div className="w-16 h-1 mx-auto bg-blue-500 animate-pulse"></div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            If you are not redirected automatically, please{' '}
            <a href={targetPath} className="text-blue-500 hover:text-blue-700">
              click here
            </a>
          </p>
        </div>
      </div>
    );
  };
};

// Export named constants for common redirects
export const TERMS_REDIRECT = createLegacyRedirect('/terms');
export const PRIVACY_REDIRECT = createLegacyRedirect('/privacy');
export const DASHBOARD_REDIRECT = createLegacyRedirect('/dashboard');
export const STATUS_REDIRECT = createLegacyRedirect('/status');
