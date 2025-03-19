// Initialize polyfills
import { initPolyfills } from "@/utils/polyfills";

// Initialize on the server
initPolyfills();

// Set runtime to nodejs in development and edge in production
export const runtime = "nodejs"; // Using nodejs for stability

// Import consolidated RSC patches (must come before other imports)
import "@/utils/patches";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";

// Import ErrorBoundary
import ErrorBoundary from "@/components/ErrorBoundary";

// Import the client component wrappers
import ClientWebpackErrorHandler from "@/components/ClientWebpackErrorHandler";
// RSCErrorFix removed - now consolidated in utils/rsc-patches.ts
import ClientLayout from "@/components/ClientLayout";

// Load fonts properly
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Debt Destroyer",
  description: "Take control of your debt and financial future",
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "Smart Debt Flow | Break Free From The Weight of Debt",
    description:
      "Transform your financial burden into a clear path to freedom with AI-powered guidance.",
    url: "https://yourdomain.com",
    siteName: "Smart Debt Flow",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Debt Flow",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Debt Flow | Break Free From The Weight of Debt",
    description:
      "Transform your financial burden into a clear path to freedom with AI-powered guidance.",
    images: ["https://yourdomain.com/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-192.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    other: {
      "facebook-domain-verification": "your-facebook-verification-code",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* RSC patches are now loaded from utils/rsc-patches.ts */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {/* Wrap everything in ClientLayout to fix hydration issues */}
        <ClientLayout
          interVariable={inter.variable}
          poppinsVariable={poppins.variable}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
