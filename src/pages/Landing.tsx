import { ArrowRight, Shield, Star, Lock } from "lucide-react";
import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
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

// Add DebtPlannerPreview to lazy imports
const DebtPlannerPreview = lazy(() => import("@/components/previews/DebtPlannerPreview"));

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

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDebtPlanner, setShowDebtPlanner] = useState(false);

  const handleDebtPlannerClick = useCallback(() => {
    setShowDebtPlanner(true);
  }, []);

  const handleDebtPlannerClose = useCallback(() => {
    setShowDebtPlanner(false);
  }, []);

  const handleDebtPlannerContinue = useCallback(() => {
    setShowDebtPlanner(false);
    navigate('/signup');
  }, [navigate]);

  const handleGetStarted = useCallback((planId: string) => {
    navigate(`/signup?plan=${planId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <BackgroundElements />
      <Navbar onDebtPlannerClick={handleDebtPlannerClick} />

      {/* Hero Section */}
      <Section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            className="text-center max-w-4xl mx-auto relative"
          >
            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute -top-20 -left-20 w-40 h-40 bg-[#88B04B] rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#88B04B] rounded-full blur-[100px] pointer-events-none"
            />

            {/* Breaking chains animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-center mb-8"
            >
              <div className="relative w-24 h-24 mb-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] rounded-full opacity-20"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#88B04B]">
                    <path d="M4 13a4 4 0 014-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 12l3-3m0 0l3-3m-3 3l-3-3m3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 13a4 4 0 01-4 4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent inline-block"
              >
                Break Free From
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white inline-block relative"
              >
                The Weight of Debt
                <motion.div
                  className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                />
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              Transform your financial burden into a clear path to freedom with AI-powered guidance
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white px-8 py-3 rounded-lg text-lg group transition-transform hover:scale-105"
              >
                Start Free Trial
              </Button>
              <Button
                onClick={handleDebtPlannerClick}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg text-lg group"
              >
                Try Demo
              </Button>
            </div>

            {/* Enhanced stats with animations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <div className="text-center relative">
                <div className="absolute inset-0 bg-[#88B04B]/5 rounded-lg transform -rotate-3"></div>
                <div className="relative bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold text-[#88B04B]">50k+</h3>
                  <p className="text-gray-400">Active Users</p>
                </div>
              </div>
              <div className="text-center relative">
                <div className="absolute inset-0 bg-[#88B04B]/5 rounded-lg transform rotate-3"></div>
                <div className="relative bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold text-[#88B04B]">$2M+</h3>
                  <p className="text-gray-400">Debt Eliminated</p>
                </div>
              </div>
              <div className="text-center relative">
                <div className="absolute inset-0 bg-[#88B04B]/5 rounded-lg transform -rotate-2"></div>
                <div className="relative bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold text-[#88B04B]">4.9/5</h3>
                  <p className="text-gray-400">User Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* Reviews Section */}
      <Section className="py-20 bg-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              variants={fadeInUpVariants}
              custom={0}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Smart Debt Flow helped me create a realistic plan to become debt-free. The AI suggestions are incredibly helpful!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                  <span className="text-[#88B04B] font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium text-white">John Doe</p>
                  <p className="text-sm text-gray-400">Debt-free in 18 months</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUpVariants}
              custom={1}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The personalized insights and debt strategies have saved me thousands in interest. Absolutely worth it!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                  <span className="text-[#88B04B] font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-medium text-white">Sarah Miller</p>
                  <p className="text-sm text-gray-400">Saved $3,200 in interest</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUpVariants}
              custom={2}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The AI analysis of my spending patterns opened my eyes to savings opportunities I never knew existed."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                  <span className="text-[#88B04B] font-semibold">RJ</span>
                </div>
                <div>
                  <p className="font-medium text-white">Robert Johnson</p>
                  <p className="text-sm text-gray-400">Reduced debt by 40%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      <Suspense fallback={<SectionLoader />}>
        <Features />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <DebtManagementVisualization />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Pricing onGetStarted={handleGetStarted} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>

      <AnimatePresence>
        {showDebtPlanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Suspense fallback={<SectionLoader />}>
              <DebtPlannerPreview
                onClose={handleDebtPlannerClose}
                onContinue={handleDebtPlannerContinue}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
