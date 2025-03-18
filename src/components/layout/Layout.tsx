"use client";

import React from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipToContent from "@/components/SkipToContent";
import { useAuth } from "@/components/AuthProvider"; // Updated to use the new AuthProvider
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import ScrollToTop from "@/components/ScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
  pageId?: string;
  navbarProps?: any; // Add navbarProps
}

export function Layout({
  children,
  title = "Smart Debt Flow",
  description = "Manage your debt smartly and efficiently",
  requireAuth = false,
  showNavbar = true,
  showFooter = true,
  className = "",
  pageId = "",
  navbarProps = {}, // Add navbarProps with default empty object
}: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  // Handle protected pages
  React.useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [requireAuth, isAuthenticated, isLoading, router, currentPath]);

  // Get current page class for styling purposes
  const getPageClass = (path: string): string => {
    const segment = path.split("/")[1] || "home";
    return `page-${segment}`;
  };

  const pageClass = getPageClass(pathname || "");

  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <img
            src="/favicon-192.png"
            alt="Logo"
            width={80}
            height={80}
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
          Preparing your dashboard...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={cn(
          "min-h-screen bg-background text-foreground",
          "app-container",
          pageClass,
          className
        )}
        id={pageId || pageClass}
      >
        <SkipToContent />

        {showNavbar && <Navbar {...navbarProps} />}

        <main id="main-content" tabIndex={-1} className="bg-background">
          {children}
        </main>

        {showFooter && <Footer />}

        <ScrollToTop />
      </div>
    </>
  );
}
