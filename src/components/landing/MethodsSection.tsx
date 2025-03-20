'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  PieChart,
  BarChart,
  LineChart,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Minus,
  Square,
  ChevronLeft,
  ChevronDown,
  RotateCw,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

// Enhanced animation variants with immediate visibility
const containerVariants = {
  hidden: { opacity: 1, y: 0 },  // Start visible
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99],
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const progressVariants = {
  hidden: { pathLength: 0 },
  visible: { 
    pathLength: 1,
    transition: { 
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

// Enhanced feature steps with more detailed previews
const featureSteps = [
  {
    id: 'overview',
    title: 'Smart Overview',
    icon: PieChart,
    description: 'Get a comprehensive view of your debt situation with our intelligent dashboard.',
    preview: {
      totalDebt: 25750.45,
      monthlyPayment: 842.35,
      debtReduction: 712.89,
      remainingMonths: 36,
      progress: 65,
      breakdown: [
        { name: 'Credit Cards', amount: 15250.30, color: '#3b82f6' },
        { name: 'Personal Loans', amount: 8500.15, color: '#10b981' },
        { name: 'Other Debts', amount: 2000.00, color: '#6366f1' }
      ],
      monthlyTrend: [
        { month: 'Jan', amount: 27200 },
        { month: 'Feb', amount: 26800 },
        { month: 'Mar', amount: 26200 },
        { month: 'Apr', amount: 25750.45 }
      ]
    }
  },
  {
    id: 'tracking',
    title: 'Payment Tracking',
    icon: Calendar,
    description: 'Stay on top of your payments with automated tracking and reminders.',
    preview: {
      upcomingPayment: {
        date: '2024-05-01',
        amount: 450.00,
        account: 'Credit Card A',
        status: 'pending',
        daysLeft: 5
      },
      recentPayment: {
        date: '2024-04-15',
        amount: 450.00,
        account: 'Credit Card A',
        status: 'completed',
        confirmation: 'TX123456789'
      },
      paymentSchedule: [
        { date: '2024-05-01', amount: 450.00, account: 'Credit Card A', isPriority: true },
        { date: '2024-05-10', amount: 250.00, account: 'Personal Loan', isPriority: false },
        { date: '2024-05-15', amount: 142.35, account: 'Credit Card B', isPriority: false }
      ],
      notifications: [
        { type: 'reminder', message: 'Payment due in 5 days', severity: 'warning' },
        { type: 'success', message: 'Last payment successful', severity: 'success' }
      ]
    }
  },
  {
    id: 'strategies',
    title: 'Debt Strategies',
    icon: TrendingUp,
    description: 'Choose between Snowball and Avalanche methods to optimize your debt payoff journey.',
    preview: {
      strategies: [
        {
          name: 'Snowball',
          description: 'Pay off smallest debts first for psychological wins',
          recommendation: true,
          benefits: [
            'Quick wins boost motivation',
            'Simplified debt management',
            'Psychological advantage'
          ],
          projection: {
            monthsToDebtFree: 32,
            totalInterestPaid: 3850.25,
            monthlySavings: 125.50
          }
        },
        {
          name: 'Avalanche',
          description: 'Focus on highest interest rates to minimize cost',
          benefits: [
            'Minimize interest payments',
            'Mathematically optimal',
            'Faster debt freedom'
          ],
          projection: {
            monthsToDebtFree: 30,
            totalInterestPaid: 3250.75,
            monthlySavings: 150.25
          }
        }
      ],
      comparison: {
        labels: ['Month 6', 'Month 12', 'Month 18', 'Month 24'],
        snowball: [23500, 20100, 16200, 11800],
        avalanche: [23200, 19500, 15400, 10900]
      }
    }
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    icon: LineChart,
    description: 'Get personalized AI-driven recommendations based on your spending patterns.',
    preview: {
      insights: [
        {
          type: 'opportunity',
          title: 'Potential Savings Found',
          description: 'Recurring subscription costs could be reduced by $127/month',
          action: 'Review Subscriptions',
          impact: 'High',
          savings: 127.00
        },
        {
          type: 'alert',
          title: 'Unusual Spending Pattern',
          description: 'Dining expenses increased 45% this month',
          action: 'View Breakdown',
          impact: 'Medium',
          trend: 45
        },
        {
          type: 'recommendation',
          title: 'Debt Consolidation Opportunity',
          description: 'You could save $2,450 in interest with a consolidation loan',
          action: 'Explore Options',
          impact: 'High',
          savings: 2450.00
        },
        {
          type: 'prediction',
          title: 'Cash Flow Forecast',
          description: 'Potential shortfall next month based on current trends',
          action: 'View Forecast',
          impact: 'Medium',
          amount: 350.00
        }
      ],
      spendingPatterns: {
        categories: ['Groceries', 'Entertainment', 'Shopping', 'Bills'],
        current: [450, 200, 300, 800],
        average: [400, 250, 350, 800],
        trend: ['+12%', '-20%', '-14%', '0%']
      }
    }
  }
];

const AUTO_PLAY_INTERVAL = 8000; // 8 seconds instead of 5

const MethodsSection = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('snowball');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "0px" });
  const controls = useAnimation();
  const progress = useMotionValue(0);
  const progressPercent = useTransform(progress, [0, 1], [0, 100]);

  // Enhanced auto-play functionality with smooth transitions
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % featureSteps.length;
        controls.start({
          opacity: [1, 0.5, 1],
          x: [-10, 0, 10],
          transition: { duration: 1.2 } // Slower transition
        });
        return next;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, controls]);

  // Always show content immediately
  useEffect(() => {
    // Force visibility immediately
    controls.start("visible");
    
    // Set progress to 1 after a short delay
    const timer = setTimeout(() => {
      progress.set(1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [controls, progress]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const renderOverviewPreview = () => (
    <motion.div
      key="overview"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Hero Message */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1DB954] to-[#1DB954]/80 bg-clip-text text-transparent">
          Take Control of Your Financial Future
        </h3>
        <p className="text-muted-foreground">Gain clarity and confidence with a comprehensive view of your debt</p>
      </motion.div>

      {/* Dashboard Preview */}
      <Card className="p-6 bg-card border-border shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-foreground">Debt Overview</h4>
          <span className="text-xs text-muted-foreground">Last updated: Today</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-accent/30">
            <p className="text-xs text-muted-foreground mb-1">Total Debt</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(featureSteps[0].preview.totalDebt)}</p>
            <p className="text-xs text-[#1DB954] flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              {formatCurrency(featureSteps[0].preview.debtReduction)} this month
            </p>
          </div>
          <div className="p-4 rounded-lg bg-accent/30">
            <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-xl font-bold text-[#1DB954]">{formatCurrency(featureSteps[0].preview.monthlyPayment)}</p>
            <p className="text-xs text-muted-foreground mt-1">Next: May 1, 2024</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/30">
            <p className="text-xs text-muted-foreground mb-1">Time to Freedom</p>
            <p className="text-xl font-bold text-foreground">{featureSteps[0].preview.remainingMonths} months</p>
            <p className="text-xs text-muted-foreground mt-1">Debt-free by 2027</p>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h5 className="text-sm font-medium text-foreground">Debt Reduction Progress</h5>
            <span className="text-sm text-[#1DB954]">{featureSteps[0].preview.progress}%</span>
          </div>
          <div className="w-full h-2 bg-accent/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#1DB954] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${featureSteps[0].preview.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-foreground mb-4">Debt Breakdown</h5>
          <div className="space-y-3">
            {featureSteps[0].preview.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Call to Action */}
      <motion.div
        className="mt-8 text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={handleSignup}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get Your Free Debt Analysis
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">No credit card required • Free forever</p>
      </motion.div>
    </motion.div>
  );

  const renderTrackingPreview = () => (
    <motion.div
      key="tracking"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Hero Message */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1DB954] to-[#1DB954]/80 bg-clip-text text-transparent">
          Say Goodbye to Due Date Anxiety
        </h3>
        <p className="text-muted-foreground">Let us handle the stress of remembering - you focus on living</p>
      </motion.div>

      {/* Enhanced Notifications */}
      <div className="space-y-3">
        {featureSteps[1].preview.notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`p-4 rounded-lg flex items-center gap-3 transform transition-all duration-300 hover:scale-102 ${
              notification.severity === 'warning' 
                ? 'bg-yellow-500/10 border border-yellow-500/20' 
                : 'bg-green-500/10 border border-green-500/20'
            }`}
          >
            {notification.severity === 'warning' ? (
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )}
            <span className="text-base font-medium text-foreground">{notification.message}</span>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Upcoming Payment Card */}
      <Card className="p-6 bg-card border-border hover:shadow-lg transition-all duration-300">
        <h4 className="text-lg font-semibold text-foreground mb-4">Next Payment Due</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#1DB954]/10">
              <Calendar className="h-6 w-6 text-[#1DB954]" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(featureSteps[1].preview.upcomingPayment.amount)}</p>
              <p className="text-sm text-muted-foreground">
                Due {formatDate(featureSteps[1].preview.upcomingPayment.date)}
                <span className="ml-2 text-yellow-500 font-medium">
                  ({featureSteps[1].preview.upcomingPayment.daysLeft} days left)
                </span>
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSignup}
            className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Pay Now
          </Button>
        </div>
      </Card>

      {/* Call to Action */}
      <motion.div
        className="mt-8 text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={handleSignup}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Start Tracking Your Payments
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Join 50,000+ users managing their debt smarter</p>
      </motion.div>
    </motion.div>
  );

  const renderStrategiesPreview = () => (
    <motion.div
      key="strategies"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Hero Message */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1DB954] to-[#1DB954]/80 bg-clip-text text-transparent">
          Your Path, Your Pace, Our Expertise
        </h3>
        <p className="text-muted-foreground">From high-net-worth optimization to debt-free dreams, we've got your strategy</p>
      </motion.div>

      {/* Enhanced Strategy Selector */}
      <div className="flex gap-2 p-1 bg-accent/50 rounded-lg">
        {['snowball', 'avalanche'].map((strategy) => (
          <motion.button
            key={strategy}
            className={`flex-1 px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
              selectedStrategy === strategy 
                ? 'bg-[#1DB954] text-white shadow-lg' 
                : 'hover:bg-accent text-muted-foreground'
            }`}
            onClick={() => setSelectedStrategy(strategy)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Strategy Details with Enhanced Visual Appeal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStrategy}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#1DB954]/10">
                  <TrendingUp className="h-6 w-6 text-[#1DB954]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">
                    {selectedStrategy === 'snowball' ? 'Snowball Method' : 'Avalanche Method'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedStrategy === 'snowball' 
                      ? 'Pay off smallest debts first for quick wins' 
                      : 'Target highest interest rates first'}
                  </p>
                </div>
              </div>
              {selectedStrategy === 'snowball' && (
                <span className="px-3 py-1 bg-[#1DB954]/20 text-[#1DB954] text-sm font-medium rounded-full">
                  Recommended
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-accent/30">
                <p className="text-sm text-muted-foreground mb-1">Time to Freedom</p>
                <p className="text-2xl font-bold text-foreground">
                  {selectedStrategy === 'snowball' 
                    ? featureSteps[2].preview.strategies[0].projection.monthsToDebtFree
                    : featureSteps[2].preview.strategies[1].projection.monthsToDebtFree} months
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30">
                <p className="text-sm text-muted-foreground mb-1">Monthly Savings</p>
                <p className="text-2xl font-bold text-[#1DB954]">
                  {formatCurrency(
                    selectedStrategy === 'snowball'
                      ? featureSteps[2].preview.strategies[0].projection.monthlySavings
                      : featureSteps[2].preview.strategies[1].projection.monthlySavings
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(selectedStrategy === 'snowball' 
                ? featureSteps[2].preview.strategies[0].benefits
                : featureSteps[2].preview.strategies[1].benefits
              ).map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-[#1DB954]" />
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Call to Action */}
          <motion.div
            className="mt-8 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleSignup}
              className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Stress-Free Journey
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Join executives and families achieving peace of mind</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  const renderAiInsightsPreview = () => (
    <motion.div
      key="ai-insights"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Hero Message */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1DB954] to-[#1DB954]/80 bg-clip-text text-transparent">
          AI-Powered Financial Guidance
        </h3>
        <p className="text-muted-foreground">Smart recommendations tailored to your spending patterns</p>
      </motion.div>

      {/* AI Insights */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {featureSteps[3].preview.insights.slice(0, 2).map((insight, index) => (
          <Card 
            key={index}
            className="p-6 bg-card border-border hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              {insight.type === 'opportunity' && (
                <div className="p-2 rounded-full bg-[#1DB954]/10">
                  <TrendingUp className="h-5 w-5 text-[#1DB954]" />
                </div>
              )}
              {insight.type === 'alert' && (
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
              )}
              {insight.type === 'recommendation' && (
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
              )}
              {insight.type === 'prediction' && (
                <div className="p-2 rounded-full bg-purple-500/10">
                  <BarChart className="h-5 w-5 text-purple-500" />
                </div>
              )}
              
              <span className={`
                text-xs font-medium px-2 py-1 rounded-full 
                ${insight.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}
              `}>
                {insight.impact} Impact
              </span>
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">{insight.title}</h4>
            <p className="text-muted-foreground text-sm mb-4">{insight.description}</p>
            <Button 
              onClick={handleSignup}
              className="w-full bg-accent/50 hover:bg-accent text-foreground"
              variant="outline"
            >
              {insight.action}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Spending Patterns */}
      <Card className="p-6 bg-card border-border">
        <h4 className="text-lg font-semibold text-foreground mb-4">Spending Pattern Analysis</h4>
        <div className="space-y-4">
          {featureSteps[3].preview.spendingPatterns.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{category}</span>
                  <span className="text-sm font-medium text-foreground">
                    ${featureSteps[3].preview.spendingPatterns.current[index]}
                  </span>
                </div>
                <div className="relative h-2 bg-accent/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(featureSteps[3].preview.spendingPatterns.current[index] / Math.max(...featureSteps[3].preview.spendingPatterns.current)) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`absolute top-0 left-0 h-full rounded-full ${
                      index === 0 ? 'bg-[#1DB954]' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>
              <span className={`ml-4 text-xs font-medium ${
                featureSteps[3].preview.spendingPatterns.trend[index].startsWith('+')
                  ? 'text-red-500'
                  : featureSteps[3].preview.spendingPatterns.trend[index].startsWith('-')
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}>
                {featureSteps[3].preview.spendingPatterns.trend[index]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Call to Action */}
      <motion.div
        className="mt-8 text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={handleSignup}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get AI-Powered Insights
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Unlock smarter financial decisions with AI</p>
      </motion.div>
    </motion.div>
  );

  const BrowserChrome = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
      <div className="bg-accent/50 p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-background/80 rounded-md py-1 px-3 text-xs text-muted-foreground flex items-center w-2/3">
            <span className="flex-1 truncate text-center">smartdebtflow.com/methods</span>
          </div>
        </div>
      </div>
      <div className="bg-background p-4">
        {children}
      </div>
    </div>
  );

  return (
    <section id="methods" className="py-24 bg-gradient-to-b from-background to-accent/10 border-t border-b border-accent/50 min-h-[600px]">
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="visible"
        animate="visible"
        className="container mx-auto px-4"
      >
        <div className="text-center mb-16">
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
          >
            Break Free from Financial Stress
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            Whether you're optimizing wealth or seeking relief, our intelligent system transforms debt from a burden into an opportunity.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Live Demo
            </span>
            <span>•</span>
            <span className="text-primary">Trusted by thousands of users worldwide</span>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute -top-20 -left-20 w-72 h-72 bg-[#1DB954] rounded-full blur-[120px] pointer-events-none dark:opacity-15 light:opacity-5"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#1DB954] rounded-full blur-[120px] pointer-events-none dark:opacity-15 light:opacity-5"
          />

          <BrowserChrome>
            <AnimatePresence mode="wait">
              {activeStep === 0 && renderOverviewPreview()}
              {activeStep === 1 && renderTrackingPreview()}
              {activeStep === 2 && renderStrategiesPreview()}
              {activeStep === 3 && renderAiInsightsPreview()}
            </AnimatePresence>
          </BrowserChrome>

          {/* Enhanced play/pause control */}
          <div className="flex flex-col items-center mt-8 gap-4">
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                ${isPlaying 
                  ? 'bg-[#1DB954] text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
                transition-all duration-300 ease-out
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-1" />
              )}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#1DB954]"
                initial={false}
                animate={isPlaying ? {
                  scale: [1, 1.1, 1],
                  opacity: [1, 0, 1]
                } : { scale: 1, opacity: 1 }}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
            
            <div className="flex gap-2">
              {featureSteps.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setActiveStep(index);
                    setIsPlaying(false);
                  }}
                  className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                    activeStep === index ? 'bg-[#1DB954]' : 'bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: activeStep === index ? 1.1 : 1
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default MethodsSection;