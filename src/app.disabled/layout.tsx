// Initialize polyfills
import { initPolyfills } from "@/utils/polyfills";

// Initialize on the server
initPolyfills();

// Set runtime to nodejs in development and edge in production
export const runtime = "nodejs"; // Using nodejs for stability

// Import RSC patch (must come before other imports)
import "./rsc-patch";

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
import RSCErrorFix from "@/components/RSCErrorFix";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    // 1. Patch webpack require
                    var patchWebpackRequire = function() {
                      if (window.__webpack_require__) {
                        var originalRequire = window.__webpack_require__;
                        window.__webpack_require__ = function(id) {
                          try {
                            if (id == null) return {};
                            return originalRequire(id);
                          } catch (e) {
                            console.warn('Error in webpack require:', e);
                            return {};
                          }
                        };
                        
                        // Copy properties
                        for (var key in originalRequire) {
                          if (originalRequire.hasOwnProperty(key)) {
                            window.__webpack_require__[key] = originalRequire[key];
                          }
                        }
                      }
                    };
                    
                    // 2. Suppress hydration errors
                    var suppressHydrationErrors = function() {
                      var originalConsoleError = console.error;
                      console.error = function() {
                        var args = Array.prototype.slice.call(arguments);
                        var message = args[0] || '';
                        if (typeof message === 'string' && (
                          message.indexOf('hydration') !== -1 || 
                          message.indexOf('Hydration') !== -1 ||
                          message.indexOf('did not match') !== -1 ||
                          message.indexOf('Expected server HTML') !== -1
                        )) {
                          // Skip logging hydration errors
                          return;
                        }
                        return originalConsoleError.apply(console, args);
                      };

                      // Mark as already hydrated
                      window.__NEXT_HYDRATED__ = true;
                      window.__NEXT_HYDRATION_COMPLETE__ = true;
                      window.__NEXT_HYDRATION_ERROR_SUPPRESSED__ = true;
                    };
                    
                    // Apply patches
                    patchWebpackRequire();
                    suppressHydrationErrors();
                    
                    // Also apply after a short delay for race conditions
                    setTimeout(function() {
                      patchWebpackRequire();
                      suppressHydrationErrors();
                    }, 0);
                  }
                } catch (e) {
                  console.warn('Error in patch script:', e);
                }
              })();
            `,
          }}
        />
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
