// Initialize polyfills at the top of the file
import { initPolyfills } from '@/utils/polyfills';

// Initialize on the server
initPolyfills();

import { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import '../styles/globals.css';
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import ThemeProvider from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Inter, Poppins } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';

// Load fonts properly
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Smart Debt Flow',
    default: 'Smart Debt Flow | Break Free From The Weight of Debt',
  },
  description: 'Transform your financial burden into a clear path to freedom with AI-powered guidance. Smart Debt Flow helps you manage and eliminate debt faster.',
  metadataBase: new URL('https://yourdomain.com'),
  openGraph: {
    title: 'Smart Debt Flow | Break Free From The Weight of Debt',
    description: 'Transform your financial burden into a clear path to freedom with AI-powered guidance.',
    url: 'https://yourdomain.com',
    siteName: 'Smart Debt Flow',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Smart Debt Flow',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Debt Flow | Break Free From The Weight of Debt',
    description: 'Transform your financial burden into a clear path to freedom with AI-powered guidance.',
    images: ['https://yourdomain.com/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-192.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
    other: {
      'facebook-domain-verification': 'your-facebook-verification-code',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Removed the preload link for inter-var.woff2 as it's not being used */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="system" storageKey="smartdebtflow-theme">
            <AuthProvider>
              <SecurityProvider>
                <DeviceProvider>
                  {children}
                  <Toaster position="top-right" />
                  <CookieConsent />
                </DeviceProvider>
              </SecurityProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
} 