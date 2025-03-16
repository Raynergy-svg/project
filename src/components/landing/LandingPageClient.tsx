"use client";

// Import webpack patch to fix "Cannot read properties of undefined (reading 'call')" error
import "@/utils/webpackPatch";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-adapter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import BackgroundElements from "@/components/BackgroundElements";
import Section from "@/components/Section";
import SectionLoader from "@/components/SectionLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientWrapper from "./ClientWrapper";
import ScrollToTop from "@/components/ScrollToTop";

// Define component props interface
interface LandingPageClientProps {
  initialData?: {
    pageMetadata?: {
      title?: string;
      description?: string;
      ogImage?: string;
      ogUrl?: string;
    };
    [key: string]: any;
  };
}

// Client-Side Component that handles interactive elements
const LandingPageClient = ({ initialData = {} }: LandingPageClientProps) => {
  // State hooks
  const [isLoading, setIsLoading] = useState(true);
  const [componentError, setComponentError] = useState(false);

  // Router and auth hooks - with safety checks
  const router = useRouter();
  const authContext = useAuth();
  const isAuthenticated = authContext ? authContext.isAuthenticated : false;

  const motionContext = useReducedMotion();
  const prefersReducedMotion = motionContext
    ? motionContext.prefersReducedMotion
    : false;

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Callback functions
  const handleSignIn = useCallback(() => {
    if (router) router.push("/signin");
  }, [router]);

  const handleSignUp = useCallback(() => {
    if (router) router.push("/signup");
  }, [router]);

  const handleDashboardClick = useCallback(() => {
    if (router) router.push("/dashboard");
  }, [router]);

  const handleGetStarted = useCallback(
    (planId: string) => {
      if (router) router.push(`/signup?plan=${planId}`);
    },
    [router]
  );

  const handleNavigateToSection = useCallback((sectionId: string) => {
    if (typeof window !== "undefined") {
      const section = document.getElementById(sectionId);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  const handleFeatureClick = useCallback(
    (featureId: string) => {
      if (router) router.push(`/signup?feature=${featureId}`);
    },
    [router]
  );

  // Load state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Improved preloading with proper type and timing
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only preload if we're sure the logo will be used soon
    const logoElement = document.querySelector('img[src="/logo.svg"]');

    // If the logo is already in the DOM, no need to preload
    if (logoElement) return;

    // Create preload link with proper attributes for SVG
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.type = "image/svg+xml"; // Specify the correct MIME type for SVG
    link.href = "/logo.svg";
    document.head.appendChild(link);

    // Remove the preload link if not used within 5 seconds
    const timeout = setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Error handler
  useEffect(() => {
    const handleError = () => {
      setComponentError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (componentError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-center mb-4">
          We're having trouble loading this page. Please try refreshing.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout
        showNavbar={true}
        navbarProps={{
          onSignIn: handleSignIn,
          onSignUp: handleSignUp,
          onDashboardClick: handleDashboardClick,
          isAuthenticated: isAuthenticated,
          onNavigate: handleNavigateToSection,
          transparent: false,
        }}
      >
        <BackgroundElements />
        <main className="relative">
          {/* Hero Section */}
          <Section className="pt-32 pb-20">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto">
                <div className="mb-12">
                  <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                      <span className="text-primary inline-block">
                        Break Free From The
                        <br className="hidden md:block" />
                        Weight of Debt
                      </span>
                    </h1>
                    <h2 className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                      Transform your financial burden into a clear path to
                      freedom with AI-powered guidance
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                      <Button
                        size="lg"
                        onClick={handleSignUp}
                        className="font-medium text-lg bg-primary hover:bg-primary/90 text-white"
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleNavigateToSection("features")}
                        className="font-medium text-lg border-primary/70 text-primary hover:bg-primary/10 dark:border-white/70 dark:text-white dark:hover:bg-white/10"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Features Section - Using ClientWrapper instead of direct imports */}
          <div id="features">
            <ClientWrapper
              componentName="Features"
              props={{
                onFeatureClick: handleFeatureClick,
                id: "features",
              }}
              fallback={<SectionLoader />}
            />
          </div>

          {/* Methods Section - Using ClientWrapper */}
          <ClientWrapper
            componentName="MethodsSection"
            fallback={<SectionLoader />}
          />

          {/* Testimonials Section - Using ClientWrapper */}
          <ClientWrapper
            componentName="Testimonials"
            fallback={<SectionLoader />}
          />

          {/* Pricing Section - Using ClientWrapper */}
          <div id="pricing">
            <ClientWrapper
              componentName="Pricing"
              props={{ onGetStarted: handleGetStarted }}
              fallback={<SectionLoader />}
            />
          </div>
        </main>

        {/* Add ScrollToTop button */}
        <ScrollToTop position="bottom-right" />
      </Layout>
    </ErrorBoundary>
  );
};

export default LandingPageClient;
