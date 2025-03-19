import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/empty-module-browser';
import { Check, ArrowRight, XCircle } from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Smart Debt Flow',
    description: 'Let\'s set up your account to get the most out of your subscription.',
    buttonText: 'Get Started',
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself so we can tailor your experience.',
    buttonText: 'Continue',
  },
  {
    id: 'accounts',
    title: 'Add Your Debt Accounts',
    description: 'Add your credit cards, loans, and other debts to start tracking.',
    buttonText: 'Continue',
  },
  {
    id: 'goals',
    title: 'Set Your Financial Goals',
    description: 'Define your debt-free timeline and financial objectives.',
    buttonText: 'Continue',
  },
  {
    id: 'finished',
    title: 'You\'re All Set!',
    description: 'Your account is ready. Start managing your debt more effectively.',
    buttonText: 'Go to Dashboard',
  },
];

interface UserOnboardingProps {
  onComplete: () => void;
  subscriptionPlan?: string;
}

export function UserOnboarding({ onComplete, subscriptionPlan = 'Premium' }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleNext = () => {
    // Mark current step as completed
    setCompleted([...completed, steps[currentStep].id]);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step completed
      onComplete();
    }
  };

  const handleSkip = () => {
    // Skip to dashboard
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] rounded-xl max-w-4xl w-full overflow-hidden shadow-xl"
      >
        {/* Progress bar */}
        <div className="w-full bg-[#2A2A2A] h-1">
          <div 
            className="bg-[#88B04B] h-full transition-all duration-300" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        <div className="grid md:grid-cols-5">
          {/* Left sidebar */}
          <div className="hidden md:block bg-[#151515] p-6 space-y-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Setup Steps</h3>
              <p className="text-sm text-white/60">Complete these steps to get started</p>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    index === currentStep 
                      ? 'bg-[#88B04B]/20 text-[#88B04B]' 
                      : completed.includes(step.id)
                        ? 'text-white/60'
                        : 'text-white/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    completed.includes(step.id)
                      ? 'bg-[#88B04B] text-white'
                      : index === currentStep
                        ? 'border-2 border-[#88B04B] text-[#88B04B]'
                        : 'border border-white/30 text-white/40'
                  }`}>
                    {completed.includes(step.id) ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Content area */}
          <div className="p-8 md:col-span-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
              <button 
                onClick={handleSkip}
                className="text-white/50 hover:text-white text-sm flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Skip Setup</span>
              </button>
            </div>
            
            <div className="mb-10">
              <p className="text-white/80 mb-6">{steps[currentStep].description}</p>
              
              {currentStep === 0 && (
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Your {subscriptionPlan} Plan Includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="bg-[#88B04B]/20 p-1 rounded-full mt-1">
                        <Check className="w-4 h-4 text-[#88B04B]" />
                      </div>
                      <span>Advanced debt payoff strategies and planning tools</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#88B04B]/20 p-1 rounded-full mt-1">
                        <Check className="w-4 h-4 text-[#88B04B]" />
                      </div>
                      <span>Unlimited debt accounts and tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#88B04B]/20 p-1 rounded-full mt-1">
                        <Check className="w-4 h-4 text-[#88B04B]" />
                      </div>
                      <span>Financial goal planning and tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-[#88B04B]/20 p-1 rounded-full mt-1">
                        <Check className="w-4 h-4 text-[#88B04B]" />
                      </div>
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Profile form fields would go here */}
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-white/10">
                    <p className="text-white/70">Profile setup form will be displayed here</p>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* Debt accounts form would go here */}
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-white/10">
                    <p className="text-white/70">Debt accounts form will be displayed here</p>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  {/* Financial goals form would go here */}
                  <div className="bg-[#2A2A2A] rounded-lg p-6 border border-white/10">
                    <p className="text-white/70">Financial goals form will be displayed here</p>
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="bg-[#2A2A2A] rounded-lg p-6 text-center">
                  <div className="bg-[#88B04B]/20 p-4 rounded-full inline-flex mb-4">
                    <Check className="w-8 h-8 text-[#88B04B]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
                  <p className="text-white/70 mb-0">
                    You're ready to start your debt-free journey with Smart Debt Flow.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="md:hidden text-white/60 text-sm">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="flex gap-3 ml-auto">
                <Button 
                  onClick={handleNext}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {steps[currentStep].buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 