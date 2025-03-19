"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const ROUTES_WITHOUT_NAVBAR = [
  "/signin",
  "/signup",
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/verify",
];

// Routes that need the landing page navbar specifically
const LANDING_PAGE_ROUTES = [
  "/",
  "/about",
  "/features",
  "/pricing",
  "/contact",
  "/blog",
  "/blog/archive",
  "/blog/all",
  "/careers",
  "/help",
  "/docs",
  "/status",
  "/privacy",
  "/terms",
  "/security",
  "/faq",
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show any navbar on auth routes
  const isAuthRoute =
    pathname ? (ROUTES_WITHOUT_NAVBAR.includes(pathname) || pathname.startsWith("/auth/")) : false;

  // Show landing page navbar on landing page routes or their child routes
  const isLandingPageRoute = pathname ? (
    LANDING_PAGE_ROUTES.includes(pathname) || 
    pathname === "/" ||
    // Also match child routes of allowed paths (like /blog/[slug])
    (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/dashboard')) ||
    pathname.startsWith('/help/') ||
    pathname.startsWith('/docs/')
  ) : false;

  // Don't show any navbar on dashboard routes
  const isDashboardRoute = pathname ? pathname.startsWith("/dashboard") : false;
  
  // Debug routing for easier troubleshooting
  useEffect(() => {
    if (pathname) {
      console.log('MainLayout routing state:', { 
        pathname,
        isAuthRoute,
        isLandingPageRoute,
        isDashboardRoute,
        shouldShowNavbar: !isAuthRoute && !isDashboardRoute && isLandingPageRoute
      });
    }
  }, [pathname, isAuthRoute, isLandingPageRoute, isDashboardRoute]);

  // Determine if we should show the navbar
  const shouldShowNavbar =
    !isAuthRoute && !isDashboardRoute && isLandingPageRoute;

  if (!mounted) return null; // Prevent flash during hydration

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
