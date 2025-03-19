'use client';

import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientWebpackErrorHandler from "@/components/ClientWebpackErrorHandler";

interface ClientLayoutProps {
  children: React.ReactNode;
  interVariable: string;
  poppinsVariable: string;
}

export default function ClientLayout({ 
  children,
  interVariable,
  poppinsVariable 
}: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <ClientWebpackErrorHandler>
        <ThemeProvider 
          defaultTheme="system"
          storageKey="theme-preference"
        >
          <AuthProvider>
            <SecurityProvider>
              <DeviceProvider>
                {children}
                <Analytics />
                <SpeedInsights />
                <Toaster />
                <CookieConsent />
              </DeviceProvider>
            </SecurityProvider>
          </AuthProvider>
        </ThemeProvider>
      </ClientWebpackErrorHandler>
    </ErrorBoundary>
  );
}