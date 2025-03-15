/**
 * FontLoader.tsx
 * A component to properly load Google Fonts with CSP compatibility
 */

import React from 'react';
import Head from 'next/head';

export function FontLoader() {
  return (
    <Head>
      {/* Preconnect to Google Fonts domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Load Inter font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
        rel="stylesheet"
      />
      
      {/* Load Poppins and Inter fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" 
        rel="stylesheet"
      />
      
      {/* Fallback font styling */}
      <style jsx global>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </Head>
  );
}

export default FontLoader; 