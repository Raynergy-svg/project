import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Step {
  title: string;
  content: string;
  target: string;
}

const steps: Step[] = [
  {
    title: "Welcome to Smart Debt Flow",
    content: "Let us get started with managing your finances smarter. We will guide you through the key features.",
    target: "body"
  },
  {
    title: "Dashboard Overview",
    content: "Your financial overview at a glance. Track your progress and see insights.",
    target: "[data-tour='dashboard']"
  },
  {
    title: "Debt Management",
    content: "Plan your debt repayment strategy and track your progress.",
    target: "[data-tour='debt-planner']"
  },
  {
    title: "Budget Analysis",
    content: "Analyze your spending patterns and optimize your budget.",
    target: "[data-tour='budget']"
  }
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    // Save to user preferences that tour was completed
    localStorage.setItem('onboardingCompleted', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-50 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl p-6 max-w-md"
        style={{
          top: position.top,
          left: position.left
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-white/60 hover:text-white"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-white/80">
            {steps[currentStep].content}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-white/20 text-white/90 hover:border-[#88B04B] hover:text-[#88B04B]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="text-white/60 text-sm">
            {currentStep + 1} / {steps.length}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}