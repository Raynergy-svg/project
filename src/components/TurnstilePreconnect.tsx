/**
 * TurnstilePreconnect.tsx
 * 
 * A component to add proper preconnect links for Cloudflare Turnstile
 * and fix preload warnings for Turnstile resources
 */

'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';
import { fixExistingPreloadLinks, createPreloadLink } from '@/utils/preloadFix';

export function TurnstilePreconnect() {
  // Fix preload warnings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Fix any existing preload links
    fixExistingPreloadLinks();
    
    // Set up a MutationObserver to watch for dynamically added preload links
    const observer = new MutationObserver((mutations) => {
      let needsCheck = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeName === 'LINK') {
              needsCheck = true;
              break;
            }
          }
        }
      }
      
      if (needsCheck) {
        fixExistingPreloadLinks();
      }
    });
    
    // Start observing the document head
    observer.observe(document.head, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <Head>
      {/* Preconnect to Cloudflare challenges domain */}
      <link
        rel="preconnect"
        href="https://challenges.cloudflare.com"
        crossOrigin="anonymous"
      />
      
      {/* DNS prefetch as fallback for browsers that don't support preconnect */}
      <link
        rel="dns-prefetch"
        href="https://challenges.cloudflare.com"
      />
      
      {/* Preload the Turnstile API script with correct 'as' value */}
      <link
        rel="preload"
        href="https://challenges.cloudflare.com/turnstile/v0/api.js"
        as="script"
        crossOrigin="anonymous"
      />
    </Head>
  );
}

/**
 * Metadata version for App Router
 */
export function TurnstilePreconnectMetadata() {
  return {
    links: [
      {
        rel: 'preconnect',
        href: 'https://challenges.cloudflare.com',
        crossOrigin: 'anonymous'
      },
      {
        rel: 'dns-prefetch',
        href: 'https://challenges.cloudflare.com'
      },
      {
        rel: 'preload',
        href: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
        as: 'script',
        crossOrigin: 'anonymous'
      }
    ]
  };
}

export default TurnstilePreconnect; 