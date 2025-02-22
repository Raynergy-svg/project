import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Brain, BarChart2, TrendingDown, Lock, Clock, Sparkles, ArrowRight, DollarSign, Target, Zap, Award, PieChart, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type DebtPlannerPreviewProps = {
  onClose: () => void;
  onContinue: () => void;
};

// Mock API responses
const mockAnalysis = {
  riskScore: 0.7,
  recommendations: ["Snowball", "Avalanche"],
  projectedSavings: 12450
};

const mockStrategy = {
  method: "Hybrid",
  timeline: "24 months",
  monthlyPayment: 1200
};

const STEPS = [
  {
    title: "AI Analysis",
    description: "Our AI analyzes your financial data to create a personalized debt elimination strategy",
    icon: Brain,
    stats: {
      processed: "1M+",
      accuracy: "99.9%",
      savings: "$2.5B"
    },
    features: [
      {
        title: 'Bank-Level Security',
        description: 'Your data is protected with AES-256 encryption and SOC2 compliance',
        icon: Lock,
        metric: '256-bit',
        details: ['End-to-end encryption', 'SOC2 Type II certified', 'GDPR compliant']
      },
      {
        title: 'Real-Time Analysis',
        description: 'Continuous monitoring and optimization of your debt strategy',
        icon: Clock,
        metric: '24/7',
        details: ['Live updates', 'Market rate tracking', 'Payment optimization']
      },
      {
        title: 'Smart Assessment',
        description: 'AI-powered risk and opportunity analysis using machine learning',
        icon: Sparkles,
        metric: '99.9%',
        details: ['Risk prediction', 'Market analysis', 'Behavior patterns']
      }
    ]
  },
  {
    title: "Strategy Creation",
    description: "Customized debt elimination plan using advanced AI algorithms",
    icon: BarChart2,
    stats: {
      methods: "3+",
      optimized: "45%",
      success: "94%"
    },
    features: [
      {
        title: 'Snowball Method',
        description: 'Strategic approach to eliminate smaller debts first for psychological wins',
        icon: DollarSign,
        metric: '35% faster',
        details: ['Smallest to largest', 'Quick wins focus', 'Momentum building']
      },
      {
        title: 'Avalanche Method',
        description: 'Mathematically optimized approach targeting highest interest rates',
        icon: TrendingDown,
        metric: '45% savings',
        details: ['Interest prioritization', 'Maximum savings', 'Optimal allocation']
      },
      {
        title: 'AI Optimization',
        description: 'Dynamic hybrid approach combining multiple strategies for optimal results',
        icon: Brain,
        metric: 'Hybrid',
        details: ['Custom strategy', 'Adaptive planning', 'Market intelligence']
      }
    ]
  },
  {
    title: "Results Preview",
    description: "See your projected path to becoming debt-free with real-time simulations",
    icon: Target,
    stats: {
      timeSaved: "2.5 yrs",
      avgSavings: "$12,450",
      satisfaction: "98%"
    },
    features: [
      {
        title: 'Time Optimization',
        description: 'Accelerated debt freedom through smart payment scheduling',
        icon: Clock,
        metric: '2.5 years',
        details: ['Payment scheduling', 'Timeline projection', 'Milestone tracking']
      },
      {
        title: 'Financial Impact',
        description: 'Projected savings and financial benefits of the AI strategy',
        icon: PieChart,
        metric: '$12,450',
        details: ['Interest savings', 'Fee reduction', 'Wealth building']
      },
      {
        title: 'Success Metrics',
        description: 'Track record based on similar debt profiles and market data',
        icon: Award,
        metric: '94%',
        details: ['Success rate', 'User satisfaction', 'Goal achievement']
      }
    ]
  }
];

export function DebtPlannerPreview({ onClose, onContinue }: DebtPlannerPreviewProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const analyzeStep = async () => {
      if (activeStep === 0) {
        setIsAnalyzing(true);
        try {
          await Promise.all([
            generateAdaptiveStrategy(),
            analyzeFinancialPosition()
          ]);
        } catch (error) {
          console.error('Analysis failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    analyzeStep();
  }, [activeStep]);

  // Mock API calls with proper error handling
  const analyzeFinancialPosition = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockAnalysis;
  };

  const generateAdaptiveStrategy = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockStrategy;
  };

  const handleContinue = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Navigate to signup when 'Start Optimization' is clicked on the final step
      navigate('/signup');
    }
  };

  const StepContent = ({ step, index }: { step: typeof STEPS[0], index: number }) => {
    const Icon = step.icon;
    return (
      <motion.div 
        className="bg-gradient-to-br from-[#88B04B]/10 to-[#121212] p-6 md:p-8 rounded-2xl border border-[#88B04B]/30 backdrop-blur-lg"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#88B04B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#88B04B]/20 flex-shrink-0">
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              {step.title}
            </h3>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {Object.entries(step.stats).map(([key, value], i) => (
            <div key={key} className="bg-white/5 rounded-lg p-3 md:p-4 border border-[#88B04B]/20">
              <div className="text-[#88B04B] text-xl md:text-2xl font-bold mb-1">{value}</div>
              <div className="text-gray-400 text-xs md:text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {step.features.map((feature, i) => (
            <FeatureCard 
              key={i}
              feature={feature}
              delay={i * 0.1}
              isAnalyzing={isAnalyzing && index === 0}
            />
          ))}
        </div>

        {index === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 md:mt-8 p-4 md:p-6 bg-white/5 rounded-lg border border-[#88B04B]/20"
          >
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#88B04B]/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#88B04B]" />
              </div>
              <div>
                <h4 className="text-white font-medium text-base md:text-lg mb-0.5 md:mb-1">Enterprise-Grade Security</h4>
                <p className="text-gray-400 text-xs md:text-sm">
                  Bank-level encryption and security protocols protect your data
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Lock className="w-3 h-3 md:w-4 md:h-4 text-[#88B04B]" />
                <span>AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-3 h-3 md:w-4 md:h-4 text-[#88B04B]" />
                <span>SOC2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-[#88B04B]" />
                <span>Real-time Monitoring</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-6xl p-4 md:p-8 rounded-2xl bg-[#121212] shadow-2xl relative overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-[#88B04B]/20 scrollbar-track-transparent">
      <div className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/5 via-transparent to-transparent fixed" />
      <div className="relative z-10 min-h-full">
        <SecurityBadge />
        
        <motion.div 
          className="text-center max-w-3xl mx-auto px-4 mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent mb-3 md:mb-4">
            Watch AI Optimize Your Debt
          </h2>
          <p className="text-base md:text-xl text-gray-300 font-light leading-relaxed">
            Experience our advanced AI analysis and see your path to financial freedom
          </p>
        </motion.div>

        <div className="space-y-6 md:space-y-8">
          <AnimatePresence mode="wait">
            <StepContent step={STEPS[activeStep]} index={activeStep} key={activeStep} />
          </AnimatePresence>

          <div className="sticky bottom-0 bg-gradient-to-t from-[#121212] to-transparent pt-8 pb-4">
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-wrap justify-center gap-2 px-4">
                {STEPS.map((step, index) => (
                  <motion.button
                    key={index}
                    onClick={() => !isAnalyzing && setActiveStep(index)}
                    className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors ${
                      index === activeStep 
                        ? 'bg-[#88B04B] text-white' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                    animate={{ opacity: index === activeStep ? 1 : 0.7 }}
                  >
                    <step.icon className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm whitespace-nowrap">{step.title}</span>
                  </motion.button>
                ))}
              </div>

              <motion.div 
                className="flex justify-center gap-3 md:gap-4 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={onClose}
                  className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={activeStep < STEPS.length - 1 ? () => setActiveStep(activeStep + 1) : onContinue}
                  disabled={isAnalyzing}
                  className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-[#88B04B] text-white rounded-lg hover:bg-[#7a9d43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>
                    {isAnalyzing ? 'Analyzing...' : activeStep === STEPS.length - 1 ? 'Start Optimization' : 'Continue'}
                  </span>
                  {!isAnalyzing && <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SecurityBadge = () => (
  <div className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center gap-2 text-xs md:text-sm text-[#88B04B]">
    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
    <span>256-bit SSL Encryption</span>
  </div>
);

const FeatureCard = ({ 
  feature,
  delay,
  isAnalyzing 
}: { 
  feature: typeof STEPS[0]['features'][0];
  delay: number;
  isAnalyzing?: boolean;
}) => {
  const Icon = feature.icon;
  
  return (
    <motion.div 
      className="p-4 md:p-6 bg-white/5 rounded-xl border border-[#88B04B]/20 relative overflow-hidden group hover:border-[#88B04B]/40 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-[#88B04B]/20 rounded-lg flex items-center justify-center group-hover:bg-[#88B04B]/30 transition-colors">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#88B04B]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white text-base md:text-lg">{feature.title}</h4>
            <span className="text-[#88B04B] text-xs md:text-sm font-medium px-2 md:px-3 py-0.5 md:py-1 bg-[#88B04B]/10 rounded-full">
              {feature.metric}
            </span>
          </div>
          <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4">{feature.description}</p>
          <div className="space-y-1.5 md:space-y-2">
            {feature.details.map((detail, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
                <div className="w-1 h-1 rounded-full bg-[#88B04B]" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
          <SecureProgressBar isAnalyzing={isAnalyzing} />
        </div>
      </div>
    </motion.div>
  );
};

const SecureProgressBar = ({ isAnalyzing }: { isAnalyzing?: boolean }) => (
  <div className="w-full h-0.5 md:h-1 bg-gray-200/20 rounded-full mt-3 md:mt-4 overflow-hidden">
    <motion.div 
      className="h-full bg-[#88B04B] rounded-full"
      initial={{ width: 0 }}
      animate={isAnalyzing ? 
        { width: ['0%', '100%'], x: ['-100%', '0%'] } : 
        { width: '100%' }
      }
      transition={isAnalyzing ? 
        { duration: 1.5, repeat: Infinity } : 
        { duration: 1, delay: 0.2 }
      }
    />
  </div>
);