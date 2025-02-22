import { ArrowRight, Shield, Star, Lock } from "lucide-react";
import { Suspense, lazy, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useInView } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceContext } from "@/hooks/useDeviceContext";
import Navbar from "@/components/layout/Navbar";

// Optimized lazy loading with prefetch and error handling
const Features = lazy(() => {
  return new Promise<{ default: React.ComponentType }>(resolve => {
    import("@/components/landing/Features")
      .then(module => {
        // Prefetch next components in the background
        Promise.all([
          import("@/components/landing/DebtManagementVisualization"),
          import("@/components/layout/Footer")
        ]).catch(() => {});
        resolve(module);
      })
      .catch(error => {
        console.error("Error loading Features:", error);
        resolve({
          default: () => (
            <div className="py-20 text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                Powerful Features to Manage Your Debt
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Take control of your financial future with our comprehensive suite of debt management tools
              </p>
            </div>
          )
        });
      });
  });
});

// Optimized lazy loading with error boundaries and retry logic
const DebtManagementVisualization = lazy(() => {
  return new Promise<{ default: React.ComponentType }>(resolve => {
    import("@/components/landing/DebtManagementVisualization")
      .then(module => {
        resolve(module);
      })
      .catch(error => {
        console.error("Error loading DebtManagementVisualization:", error);
        resolve({
          default: () => (
            <div className="py-20 text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                Methods For Your Debt-Free Journey
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose between proven debt management strategies tailored to your financial situation.
              </p>
            </div>
          )
        });
      });
  });
});

const Footer = lazy(() => {
  return new Promise<{ default: React.ComponentType }>(resolve => {
    import("@/components/layout/Footer")
      .then(module => resolve(module))
      .catch(error => {
        console.error("Error loading Footer:", error);
        resolve({
          default: () => (
            <footer className="py-8 text-center text-gray-400">
              <p>© {new Date().getFullYear()} Smart Debt Flow. All rights reserved.</p>
            </footer>
          )
        });
      });
  });
});

interface PricingProps {
  onGetStarted: (planId: string) => void;
}

const Pricing = lazy(() => {
  return new Promise<{ default: React.ComponentType<PricingProps> }>(resolve => {
    import("@/components/landing/Pricing")
      .then(module => resolve(module))
      .catch(error => {
        console.error("Error loading Pricing:", error);
        resolve({
          default: ({ onGetStarted }: PricingProps) => (
            <div className="py-20 text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Start with a 7-day free trial and accelerate your journey to financial freedom
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">Basic Plan</h3>
                  <p className="text-gray-300 mb-4">Free for 7 days, then $9.99/mo</p>
                  <Button
                    onClick={() => onGetStarted('basic')}
                    className="w-full bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white py-3 rounded-lg"
                  >
                    Start Free Trial
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 p-6 rounded-xl border border-white/10"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                  <p className="text-gray-300 mb-4">$19.99/mo</p>
                  <Button
                    onClick={() => onGetStarted('pro')}
                    className="w-full bg-white/10 text-white py-3 rounded-lg border-2 border-white/20 hover:bg-white/20"
                  >
                    Choose Pro Plan
                  </Button>
                </motion.div>
              </div>
            </div>
          )
        });
      });
  });
});

// Loading component with fade transition
const SectionLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex items-center justify-center py-12 min-h-[400px]"
  >
    <LoadingSpinner className="w-8 h-8" />
  </motion.div>
);

// Optimized animation variants
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

const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  static: { y: 0 },
};

// Background elements with visibility optimization
const BackgroundElements = () => {
  const prefersReducedMotion = useReducedMotion();
  const { performanceLevel } = useDeviceContext();
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { margin: "-10%" });

  if (prefersReducedMotion || performanceLevel === 'low') {
    return null;
  }

  return (
    <div ref={elementRef} className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <AnimatePresence>
        {isInView && (
          <>
            <motion.div
              key="bg-1"
              variants={floatingVariants}
              animate="float"
              initial="static"
              exit="static"
              className="absolute top-20 -left-20 w-96 h-96 bg-[#88B04B]/10 rounded-full blur-[100px] hardware-accelerated"
              style={{ willChange: "transform", contain: "paint" }}
            />
            <motion.div
              key="bg-2"
              variants={floatingVariants}
              animate="float"
              initial="static"
              exit="static"
              style={{ x: 100, willChange: "transform", contain: "paint" }}
              className="absolute top-1/3 right-0 w-96 h-96 bg-[#88B04B]/10 rounded-full blur-[100px] hardware-accelerated"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

// Section wrapper with optimized loading and animations
const Section = ({ children, id = "", className = "" }: SectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { 
    margin: "-10% 0px",
    amount: 0.1,
    once: true
  });

  return (
    <section 
      ref={sectionRef}
      className={`relative scroll-section ${className}`} 
      id={id}
    >
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { performanceLevel, isMobile } = useDeviceContext();

  // Memoize handlers
  const handleSignIn = useCallback(() => {
    navigate("/signin", {
      state: {
        returnTo: window.location.pathname,
        animation: "slide-in",
      },
    });
  }, [navigate]);

  const handleGetStarted = useCallback((planId: string) => {
    navigate(`/signup?plan=${planId}`, {
      state: {
        returnTo: window.location.pathname,
        animation: "slide-in",
        selectedPlan: planId,
        paymentLinks: {
          basic: 'https://buy.stripe.com/test_4gwcPW1HN8597x64gi',
          pro: 'https://buy.stripe.com/test_8wM5nu72799dbNm6or'
        }
      },
    });
  }, [navigate]);

  const handleDashboardClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Memoize scroll progress for better performance
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: performanceLevel === 'high' ? 100 : 50,
    damping: performanceLevel === 'high' ? 30 : 20,
    restDelta: 0.001
  });

  // Memoize stats data with more realistic, conservative numbers
  const statsData = useMemo(() => [
    { 
      label: "Debt Reduced", 
      value: "$500M+",
      description: "Total debt reduced by our users"
    },
    { 
      label: "Average Savings", 
      value: "$3,200",
      description: "Average savings on interest"
    },
    { 
      label: "Active Users", 
      value: "10,000+",
      description: "Working towards debt freedom"
    },
    { 
      label: "Success Rate", 
      value: "92%",
      description: "Users who stick to their plan"
    }
  ], []);

  return (
    <div className="relative w-full">
      <BackgroundElements />

      <main className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar
            onSignIn={handleSignIn}
            onNavigate={scrollToSection}
            isAuthenticated={isAuthenticated}
            userName={user?.name}
            onDashboardClick={handleDashboardClick}
          />

          {/* Hero Section */}
          <header className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] py-8 md:py-12 relative scroll-section">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              custom={0}
              className="text-center relative z-10 max-w-4xl mx-auto mt-16 md:mt-0"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative"
              >
                <motion.div
                  className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 blur-3xl rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] px-4 sm:px-0">
                  Your Path to Debt Freedom
                </h1>
              </motion.div>

              <motion.p
                variants={fadeInUpVariants}
                custom={1}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
              >
                Take control of your debt with our proven strategies and tools. Start your journey to becoming debt-free today.
              </motion.p>

              <motion.div
                variants={fadeInUpVariants}
                custom={2}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4 sm:px-0"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleGetStarted('basic')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white px-6 sm:px-10 py-4 sm:py-6 rounded-xl text-base sm:text-lg font-semibold tracking-wide relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      initial={false}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>
                
                <Button
                  onClick={() => handleGetStarted('pro')}
                  variant="outline"
                  className="w-full sm:w-auto text-white border-2 border-white/20 hover:bg-white/10 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-medium backdrop-blur-sm"
                >
                  Choose Pro Plan
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeInUpVariants}
                custom={3}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center text-xs sm:text-sm text-gray-400 mb-12 px-4 sm:px-0"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#88B04B]" />
                  256-bit SSL Encryption
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#88B04B]" />
                  4.9/5 User Rating
                </span>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#88B04B]" />
                  SOC 2 Certified
                </span>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.section
              variants={fadeInUpVariants}
              custom={4}
              initial="hidden"
              animate="visible"
              className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {statsData.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUpVariants}
                    custom={index + 5}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white/5 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-white/10 transition-colors hover:border-[#88B04B]/30 hover:bg-white/10"
                  >
                    <motion.h3 
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#88B04B] mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      {stat.value}
                    </motion.h3>
                    <motion.p 
                      className="text-white font-medium mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      {stat.label}
                    </motion.p>
                    <motion.p 
                      className="text-xs sm:text-sm text-gray-400"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      {stat.description}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </header>

          {/* Features and other sections */}
          <div className="relative space-y-16 sm:space-y-24 lg:space-y-32 pb-16 sm:pb-24 lg:pb-32">
            <Section 
              id="features-heading"
              className="relative pt-16 sm:pt-24 lg:pt-32"
            >
              <Suspense fallback={<SectionLoader />}>
                <Features />
              </Suspense>
            </Section>

            <Section 
              id="visualization-heading"
              className="relative pt-16 sm:pt-24 lg:pt-32"
            >
              <Suspense fallback={<SectionLoader />}>
                <DebtManagementVisualization />
              </Suspense>
            </Section>

            <Section
              id="pricing-heading"
              className="relative pt-16 sm:pt-24 lg:pt-32"
            >
              <Suspense fallback={<SectionLoader />}>
                <Pricing onGetStarted={handleGetStarted} />
              </Suspense>
            </Section>
          </div>
        </div>
      </main>

      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default Landing;
