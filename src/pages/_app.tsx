// Import the webpack patch first to ensure it loads early
import '../utils/webpackPatch';

import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextAuthProvider } from '@/contexts/next-auth-context';
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { AuthAdapter } from '@/contexts/auth-adapter';
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import { useRouter } from 'next/router';
import ThemeProvider from '@/components/ThemeProvider';
import analytics from '@/utils/analytics';
import { initPolyfills } from '@/utils/polyfills';
import { injectEnvToWindow } from '@/utils/env';
import FontLoader from '@/components/FontLoader';
import '@/index.css';
import '@/styles/globals.css';
import '@/styles/animation-effects.css';
import Head from 'next/head';

// Initialize polyfills as early as possible
if (typeof window !== 'undefined') {
  initPolyfills();
  
  // Inject environment variables in development mode
  if (process.env.NODE_ENV === 'development') {
    injectEnvToWindow();
  }
  
  // Handle webpack errors preemptively
  window.addEventListener('error', (event) => {
    if (event.message.includes('undefined (reading \'call\')') || 
        event.message.includes('Cannot read properties of undefined')) {
      console.warn('Webpack error detected and handled:', event.message);
      event.preventDefault();
      return true;
    }
  }, true);
}

// Minimal adaptation for Next.js
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use client-side only rendering to avoid hydration issues
  useEffect(() => {
    // Initialize polyfills again on the client side
    initPolyfills();
    
    // Initialize environment variables again on client side
    if (process.env.NODE_ENV === 'development') {
      injectEnvToWindow();
    }
    
    setMounted(true);
    
    // Remove initial loader if it exists (migrated from main.tsx)
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.display = "none";
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 600);
    }
  }, []);

  // Setup analytics
  useEffect(() => {
    if (!mounted) return;
    
    // Track page views when route changes complete
    const handleRouteChange = (url: string) => {
      analytics.onRouteChangeComplete(url);
    };

    // Subscribe to router events
    router.events.on('routeChangeComplete', handleRouteChange);

    // Track initial page load
    handleRouteChange(router.asPath);

    // Cleanup event listener
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, mounted]);

  // Handle errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Here you could send to an error tracking service
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Don't render until client-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Smart Debt Flow</title>
        <meta name="description" content="Manage your debts smartly and efficiently" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Use our custom font loader */}
      <FontLoader />

      <ErrorBoundary>
        <ThemeProvider defaultTheme="system" storageKey="smartdebtflow-theme">
          <div className="font-sans">
            <NextAuthProvider>
              <AuthAdapter>
                <SecurityProvider>
                  <DeviceProvider>
                    <Component {...pageProps} />
                    <Toaster position="top-right" />
                    <CookieConsent />
                  </DeviceProvider>
                </SecurityProvider>
              </AuthAdapter>
            </NextAuthProvider>
          </div>
        </ThemeProvider>
      </ErrorBoundary>
      
      {/* Analytics */}
      <Analytics />
      <SpeedInsights />
    </>
  );
} 