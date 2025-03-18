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
    ROUTES_WITHOUT_NAVBAR.includes(pathname) || pathname.startsWith("/auth/");

  // Show landing page navbar on landing page routes
  const isLandingPageRoute =
    LANDING_PAGE_ROUTES.includes(pathname) || pathname === "/";

  // Don't show any navbar on dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");

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
