import { ArrowRight, Shield, Star, Lock, CheckCircle } from "lucide-react";
import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useInView } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceContext } from "@/hooks/useDeviceContext";
import Navbar from "@/components/layout/Navbar";
import DebtManagementVisualization from "@/components/landing/DebtManagementVisualization";
import Features from "@/components/landing/Features";

// Optimized lazy loading with prefetch and error handling
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

  const handleSignIn = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  const handleDashboardClick = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleGetStarted = useCallback((planId: string) => {
    navigate(`/signup?plan=${planId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <BackgroundElements />
      <Navbar 
        onSignIn={handleSignIn}
        isAuthenticated={isAuthenticated}
        onDashboardClick={handleDashboardClick}
      />

      {/* Hero Section */}
      <Section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
            className="text-center max-w-4xl mx-auto relative"
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
              </div>
                </motion.div>
                
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
                Start My Journey
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

      <Features id="features" />

      <div className="relative scroll-section" id="debt-management">
        <DebtManagementVisualization />
      </div>

      <Suspense fallback={<SectionLoader />}>
        <div id="pricing">
          <Pricing onGetStarted={handleGetStarted} />
        </div>
      </Suspense>

      {/* Reviews Section with Real User Stories */}
      <Section className="py-20 bg-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Real Stories, Real Results
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Join thousands of people who have transformed their financial future with Smart Debt Flow
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div
                variants={fadeInUpVariants}
                custom={0}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=200"
                    alt="Michael R."
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-white">Michael R.</h4>
                    <p className="text-sm text-gray-400">Student Loan Debt</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#88B04B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "I was drowning in $45K of student loans. The app helped me create a realistic payment plan that worked with my budget. After 14 months, I've paid off $12K and actually have savings for the first time."
                </p>
                <p className="text-sm text-[#88B04B]">$12,000 paid off in 14 months</p>
              </motion.div>

              <motion.div
                variants={fadeInUpVariants}
                custom={1}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=200"
                    alt="Emily K."
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-white">Emily K.</h4>
                    <p className="text-sm text-gray-400">Credit Card Debt</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#88B04B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "The debt avalanche strategy suggested by the AI saved me over $2,300 in interest. I was skeptical at first, but seeing my credit card balances actually going down each month is incredible."
                </p>
                <p className="text-sm text-[#88B04B]">Saved $2,300+ in interest charges</p>
              </motion.div>

              <motion.div
                variants={fadeInUpVariants}
                custom={2}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=200"
                    alt="David & Maria L."
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-white">David & Maria L.</h4>
                    <p className="text-sm text-gray-400">Multiple Debts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#88B04B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Managing multiple debts was overwhelming. The app's debt consolidation analysis showed us how to save $436/month in payments. We're now on track to be debt-free in 3 years instead of 7."
                </p>
                <p className="text-sm text-[#88B04B]">Reduced monthly payments by $436</p>
              </motion.div>
          </div>
        </div>
      </Section>

      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
}
