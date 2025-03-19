// Import consolidated patchers - order matters
import "../utils/patches"; // This includes all RSC patches in one file
import "../use-server-patch";
import "../app-router-patch";
// Other patchers
import "../webpack-error-handler";
import "../utils/webpackPatch";
import "../utils/error-boundary-patch";
import "../utils/webpack-factory-patch";

import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextAuthProvider } from "@/providers/auth/NextAuthProvider";
import { AuthAdapter } from "@/providers/auth/AuthAdapter";
import { SecurityProvider } from "@/providers/SecurityProvider";
import { DeviceProvider } from "@/providers/DeviceProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import analytics from "@/utils/analytics";
import { initPolyfills } from "@/utils/polyfills";
import { injectEnvToWindow } from "@/utils/env";
import FontLoader from "@/components/FontLoader";
import "@/index.css";
import "@/styles/globals.css";
import "@/styles/animation-effects.css";
import "@/styles/theme.css";
import Head from "next/head";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// Initialize polyfills as early as possible
if (typeof window !== "undefined") {
  initPolyfills();

  // Inject environment variables in development mode
  if (process.env.NODE_ENV === "development") {
    injectEnvToWindow();
  }

  // Patch Next.js error boundary callback function if needed
  if (typeof window.__NEXT_P !== "undefined") {
    const originalPush = window.__NEXT_P.push;
    window.__NEXT_P.push = function (args) {
      try {
        return originalPush(args);
      } catch (err) {
        console.warn("Caught Next.js routing error:", err);
        // Return a no-op function to prevent further errors
        return function () {};
      }
    };
  }

  // Handle webpack errors preemptively
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.message.includes("undefined (reading 'call')") ||
        event.message.includes("Cannot read properties of undefined") ||
        event.filename?.includes("error-boundary-callbacks.js") ||
        event.message.includes("options.factory")
      ) {
        console.warn("Webpack error detected and handled:", event.message);
        event.preventDefault();
        return true;
      }
    },
    true
  );

  // Add specific error handler for TypeError with "to" argument
  window.addEventListener(
    "error",
    (event) => {
      // Check if this is the specific error we're trying to debug
      if (
        event.message.includes('The "to" argument must be of type string') ||
        event.error?.code === "ERR_INVALID_ARG_TYPE"
      ) {
        console.error("CAUGHT TYPE ERROR:", event.error);
        console.error("Error stack:", event.error?.stack);
        event.preventDefault();
        return true;
      }
    },
    true
  );
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
    if (process.env.NODE_ENV === "development") {
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
    router.events.on("routeChangeComplete", handleRouteChange);

    // Track initial page load
    handleRouteChange(router.asPath);

    // Cleanup event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router, mounted]);

  // Handle errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      // Here you could send to an error tracking service
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Don't render until client-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>SmartDebtFlow - Take Control of Your Finances</title>
        <meta
          name="description"
          content="Manage your debts smartly and efficiently"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Use our custom font loader */}
      <FontLoader />

      <ErrorBoundary>
        <ThemeProvider>
          <div className={`${nunito.variable} font-sans`}>
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
