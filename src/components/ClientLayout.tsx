"use client";

import React, { useState, useEffect } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientWebpackErrorHandler from "@/components/ClientWebpackErrorHandler";
import RSCErrorFix from "@/components/RSCErrorFix";
import HydrationErrorSuppressor from "@/components/HydrationErrorSuppressor";
import { applyHydrationErrorPatch } from "@/utils/hydration-patch";
import dynamic from "next/dynamic";
import MainLayout from "./MainLayout";

// Dynamically import NotFoundErrorBoundaryFix to prevent bundling issues
const NotFoundErrorBoundaryFix = dynamic(() => import("@/app/_utils/not-found-fix"), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
  interVariable: string;
  poppinsVariable: string;
}

/**
 * ClientLayout
 *
 * A client-only component that wraps the entire application to fix hydration issues.
 * This ensures that client-side components are not rendered during SSR,
 * preventing hydration mismatches.
 */
export default function ClientLayout({
  children,
  interVariable,
  poppinsVariable,
}: ClientLayoutProps) {
  // State to track if we're mounted on the client
  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix - only render once mounted on client
  useEffect(() => {
    // Apply all hydration error patches first
    if (typeof window !== "undefined") {
      // Apply direct hydration error patch
      applyHydrationErrorPatch();
    }

    // Mark as mounted on client
    setIsMounted(true);
  }, []);

  // Handle hydration issues for NotFoundErrorBoundary
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Force client-side rendering on navigation
      const handleRouteChange = () => {
        setIsMounted(false);
        setTimeout(() => setIsMounted(true), 0);
      };

      window.addEventListener("popstate", handleRouteChange);

      return () => {
        window.removeEventListener("popstate", handleRouteChange);
      };
    }
  }, []);

  // During SSR, render minimal content to prevent hydration errors
  if (!isMounted) {
    return (
      <div
        className={`${interVariable} ${poppinsVariable} font-sans min-h-screen bg-background dark:bg-background`}
      >
        {/* Elegant loading screen that matches landing page aesthetic */}
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          <div className="relative">
            <img
              src="/favicon-192.png"
              alt="Logo"
              width={64}
              height={64}
              className="mb-4 animate-pulse"
            />
            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-full">
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
            </div>
          </div>
          <div className="mt-6 text-primary font-bold text-xl md:text-2xl">
            Smart Debt Flow
          </div>
          <div className="mt-2 text-muted-foreground text-sm">
            Loading your experience...
          </div>
        </div>
      </div>
    );
  }

  // Once mounted on the client, render the full application
  return (
    <div className={`${interVariable} ${poppinsVariable} font-sans`}>
      {/* Global error suppressors and fixes */}
      <RSCErrorFix />
      <NotFoundErrorBoundaryFix />
      <HydrationErrorSuppressor />

      <ErrorBoundary>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientWebpackErrorHandler>
            <AuthProvider>
              <SecurityProvider>
                <DeviceProvider>
                  <MainLayout>{children}</MainLayout>
                  <Toaster />
                  <CookieConsent />
                  <Analytics />
                  <SpeedInsights />
                </DeviceProvider>
              </SecurityProvider>
            </AuthProvider>
          </ClientWebpackErrorHandler>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}
