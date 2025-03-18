"use client";

/**
 * This is a placeholder file to maintain compatibility with existing imports.
 * Landing page functionality has been moved to the App Router.
 * @deprecated Use app/page.tsx instead
 */

import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LegacyLanding() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the root page (homepage)
    router.replace('/');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Redirecting to homepage...</h1>
        <p className="mb-4">Please wait while we redirect you to the updated landing page.</p>
        <div className="w-16 h-1 mx-auto bg-blue-500 animate-pulse"></div>
      </div>
    </div>
  );
}
