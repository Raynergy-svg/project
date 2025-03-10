'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-adapter';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Layout } from '@/components/layout/Layout';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Import client components
import BackgroundElements from '@/components/BackgroundElements';
import Section from '@/components/Section';
import SectionLoader from '@/components/SectionLoader';

// Define animation variants
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

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

// Dynamic imports for non-critical sections with improved loading strategies
const EnhancedDebtVisualization = dynamic(
  () => import("@/components/landing/MethodsSection"),
  { 
    ssr: false,
    loading: () => <SectionLoader />,
    // Add a timeout to prevent long loading states
    suspense: true
  }
);

interface FeaturesProps {
  onFeatureClick?: (featureId: string) => void;
  id?: string;
}

const Features = dynamic<FeaturesProps>(
  () => import("@/components/landing/Features"),
  { 
    ssr: false,
    loading: () => <SectionLoader />,
    suspense: true
  }
);

interface PricingProps {
  onGetStarted: (planId: string) => void;
}

const Pricing = dynamic<PricingProps>(
  () => import("@/components/landing/Pricing"),
  { 
    ssr: false,
    loading: () => <SectionLoader />,
    suspense: true
  }
);

const Testimonials = dynamic(
  () => import("@/components/landing/Testimonials"),
  { 
    ssr: false, 
    loading: () => <SectionLoader />,
    suspense: true
  }
);

// Client-Side Component that handles interactive elements
const LandingPageClient = ({ initialData = {} }: LandingPageClientProps) => {
  // State hooks
  const [isLoading, setIsLoading] = useState(true);
  
  // Router and auth hooks
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { prefersReducedMotion } = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Callback functions
  const handleSignIn = useCallback(() => {
    router.push('/signin');
  }, [router]);

  const handleSignUp = useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleDashboardClick = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleGetStarted = useCallback((planId: string) => {
    router.push(`/signup?plan=${planId}`);
  }, [router]);
  
  const handleNavigateToSection = useCallback((sectionId: string) => {
    // Smooth scroll to the section
    const section = document.getElementById(sectionId);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleFeatureClick = useCallback((featureId: string) => {
    router.push(`/signup?feature=${featureId}`);
  }, [router]);
  
  // Effect to simulate loading state
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const preloadAssets = async () => {
    // Preload critical assets
    try {
      const assetsToPreload = [
        '/logo.svg',
        // Add other critical assets here
      ];
      
      // Use modern browser APIs for preloading
      if (typeof window !== 'undefined') {
        assetsToPreload.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });
      }
      
      // Fallback for older browsers
      const preloadPromises = assetsToPreload.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      await Promise.all(preloadPromises);
    } catch (error) {
      console.error('Error preloading assets:', error);
    }
  };

  // Preload assets when component mounts
  useEffect(() => {
    preloadAssets();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading"
        style={{
          minHeight: isMobile ? '100dvh' : '100vh',
          background: 'var(--background)'
        }}
      >
        <div className="initial-loader__spinner" />
      </motion.div>
    );
  }

  return (
    <Layout 
      showNavbar={true}
      navbarProps={{
        onSignIn: handleSignIn,
        onSignUp: handleSignUp,
        onDashboardClick: handleDashboardClick,
        isAuthenticated: isAuthenticated,
        onNavigate: handleNavigateToSection,
        transparent: false
      }}
    >
      <BackgroundElements />
      <main className="relative">
        {/* Hero Section */}
        <Section className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              className="text-center max-w-4xl mx-auto relative"
              style={{ 
                willChange: 'transform, opacity',
                contain: 'layout style paint',
                backfaceVisibility: "hidden",
                perspective: "1000px",
                transformStyle: "preserve-3d",
                transform: "translateZ(0)"
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative mb-12"
              >
                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent inline-block text-gradient-animation"
                    >
                      Break Free From
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-foreground inline-block relative"
                    >
                      The Weight of Debt
                      <motion.div
                        className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                      />
                    </motion.span>
                  </h1>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  className="absolute -top-20 -left-20 w-72 h-72 bg-primary rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                >
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }}
                  />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30 pointer-events-none"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl md:text-2xl text-muted-foreground mb-8"
              >
                Transform your financial burden into a clear path to freedom with AI-powered guidance
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => handleSignUp()}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-2 rounded-lg text-base mx-auto w-auto inline-flex items-center hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-16 max-w-4xl mx-auto">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  <div className="w-[250px] bg-card/60 border border-border rounded-lg p-6 text-center shadow-lg">
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                      <h3 className="flex items-center text-4xl font-bold">
                        <span className="text-foreground">50k</span>
                        <span className="text-primary ml-1">+</span>
                      </h3>
                      <span className="text-muted-foreground mt-2 text-sm font-medium">Active Users</span>
                    </div>
                  </div>
                  
                  <div className="w-[250px] bg-card/60 border border-border rounded-lg p-6 text-center shadow-lg">
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                      <h3 className="flex items-center text-4xl font-bold">
                        <span className="text-foreground">$2M</span>
                        <span className="text-primary ml-1">+</span>
                      </h3>
                      <span className="text-muted-foreground mt-2 text-sm font-medium">Debt Eliminated</span>
                    </div>
                  </div>
                  
                  <div className="w-[250px] bg-card/60 border border-border rounded-lg p-6 text-center shadow-lg">
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                      <h3 className="flex items-center text-4xl font-bold">
                        <span className="text-foreground">4.9</span>
                        <span className="text-primary ml-1">/5</span>
                      </h3>
                      <span className="text-muted-foreground mt-2 text-sm font-medium">User Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Lazy load non-critical sections */}
        <Suspense fallback={<SectionLoader />}>
          <Section id="features">
            <Features onFeatureClick={handleFeatureClick} />
          </Section>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Section id="debt-management">
            <EnhancedDebtVisualization />
          </Section>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Section id="pricing">
            <Pricing onGetStarted={handleGetStarted} />
          </Section>
        </Suspense>

        {/* Reviews Section with Real User Stories */}
        <Section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Real Stories, Real Results
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Join thousands of people who have transformed their financial future with Smart Debt Flow
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div
                variants={fadeInUpVariants}
                custom={0}
                className="bg-card/50 p-6 rounded-xl border border-border backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Sarah M."
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-primary/30"
                    loading="lazy"
                    sizes="56px"
                    quality={80}
                  />
                  <div>
                    <h4 className="text-foreground font-semibold">Sarah M.</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "I was drowning in credit card debt until I found Smart Debt Flow. Their AI analyzed my spending patterns and created a personalized plan. I've paid off $15,000 in just 8 months!"
                </p>
              </motion.div>
              
              <motion.div
                variants={fadeInUpVariants}
                custom={1}
                className="bg-card/50 p-6 rounded-xl border border-border backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="https://randomuser.me/api/portraits/men/45.jpg"
                    alt="David K."
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-primary/30"
                    loading="lazy"
                    sizes="56px"
                    quality={80}
                  />
                  <div>
                    <h4 className="text-foreground font-semibold">David K.</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The visual debt payoff calculator changed my life. Being able to see exactly when I'll be debt-free and how different payments affect my timeline is incredibly motivating!"
                </p>
              </motion.div>
              
              <motion.div
                variants={fadeInUpVariants}
                custom={2}
                className="bg-card/50 p-6 rounded-xl border border-border backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="Jessica T."
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-primary/30"
                    loading="lazy"
                    sizes="56px"
                    quality={80}
                  />
                  <div>
                    <h4 className="text-foreground font-semibold">Jessica T.</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The AI assistant actually understood my financial situation and gave me actionable advice that worked with my budget. I'm finally seeing my debt decrease instead of increase every month."
                </p>
              </motion.div>
            </div>
          </div>
        </Section>
      </main>

      <Analytics />
      <SpeedInsights />
    </Layout>
  );
};

export default LandingPageClient; 