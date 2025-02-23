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

      {/* Reviews Section with Photos */}
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
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                alt="John Doe"
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
              />
              <div className="flex items-center gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 text-center">
                "Smart Debt Flow helped me create a realistic plan to become debt-free. The AI suggestions are incredibly helpful!"
              </p>
              <div className="text-center">
                <p className="font-medium text-white">John Doe</p>
                <p className="text-sm text-gray-400">Debt-free in 18 months</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUpVariants}
              custom={1}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                alt="Sarah Miller"
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
              />
              <div className="flex items-center gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 text-center">
                "The personalized insights and debt strategies have saved me thousands in interest. Absolutely worth it!"
              </p>
              <div className="text-center">
                <p className="font-medium text-white">Sarah Miller</p>
                <p className="text-sm text-gray-400">Saved $3,200 in interest</p>
              </div>
            </motion.div>

                  <motion.div
                    variants={fadeInUpVariants}
              custom={2}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                alt="Robert Johnson"
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
              />
              <div className="flex items-center gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#88B04B] fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 text-center">
                "The AI analysis of my spending patterns opened my eyes to savings opportunities I never knew existed."
              </p>
              <div className="text-center">
                <p className="font-medium text-white">Robert Johnson</p>
                <p className="text-sm text-gray-400">Reduced debt by 40%</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Features Section with Illustrations */}
      <Section className="py-20">
        <div className="container mx-auto px-4">
          {/* AI-Powered Analysis */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Our advanced AI system analyzes your financial data in real-time to provide personalized recommendations and insights.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Real-time financial analysis</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Personalized debt strategies</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Smart payment optimization</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800"
                alt="AI-Powered Analysis"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Smart Financial Tools */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                alt="Smart Financial Tools"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2"
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
                Smart Financial Tools
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Leverage our comprehensive suite of tools designed to help you manage and eliminate debt effectively.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Debt payoff calculator</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Budget optimization</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#88B04B]" />
                  <span>Progress tracking</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </Section>

      <Features />

      <div className="relative scroll-section" id="visualization-heading">
        <DebtManagementVisualization />
      </div>

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
