import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  DollarSign, 
  Calculator, 
  ArrowRight,
  BarChart2,
  Bell,
  PieChart,
  Clock,
  Crown
} from 'lucide-react';
import { DebtOverview } from '@/components/dashboard/DebtOverview';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/animations/ProgressBar';
import { CircularProgress } from '@/components/animations/CircularProgress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { useOnboarding } from '@/hooks/useOnboarding';

// Define the Debt type to match the expected type in DebtOverview
type Debt = {
  id: string;
  userId: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'other';
  amount: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [selectedMethod, setSelectedMethod] = useState<'snowball' | 'avalanche'>('snowball');
  const { user, isSubscribed, subscriptionStatus, subscriptionPlan, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { shouldShowOnboarding, setOnboardingComplete } = useOnboarding(user?.id || null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Handle session_id from URL (for payment redirects)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Redirect to payment success page if session_id is present
      navigate(`/payment-success?session_id=${sessionId}`, { replace: true });
    }
  }, [location.search, navigate]);

  // Show upgrade prompt after 30 seconds for free users
  useEffect(() => {
    if (!isSubscribed && subscriptionStatus === 'free') {
      const timer = setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, subscriptionStatus]);

  const handleOnboardingComplete = () => {
    setOnboardingComplete();
  };

  const handleUpgradePromptClose = () => {
    setShowUpgradePrompt(false);
  };

  // Mock data with correct type
  const mockDebts: Debt[] = [
    {
      id: '1',
      userId: '1',
      type: 'credit_card',
      amount: 5000,
      interestRate: 0.15,
      minimumPayment: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '1',
      type: 'loan',
      amount: 15000,
      interestRate: 0.06,
      minimumPayment: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const scenarios = {
    snowball: {
      method: 'snowball',
      totalInterestPaid: 4850,
      monthsToDebtFree: 36,
      debts: [
        {
          name: 'Credit Card',
          balance: 2000,
          interestRate: 24.99,
          monthlyPayment: 300,
          progress: 45
        },
        {
          name: 'Personal Loan',
          balance: 5000,
          interestRate: 12.99,
          monthlyPayment: 200,
          progress: 15
        }
      ]
    },
    avalanche: {
      method: 'avalanche',
      totalInterestPaid: 3950,
      monthsToDebtFree: 34,
      debts: [
        {
          name: 'Credit Card',
          balance: 2000,
          interestRate: 24.99,
          monthlyPayment: 500,
          progress: 75
        },
        {
          name: 'Personal Loan',
          balance: 5000,
          interestRate: 12.99,
          monthlyPayment: 100,
          progress: 25
        }
      ]
    }
  };

  const currentScenario = scenarios[selectedMethod];

  const handleMethodChange = useCallback((method: 'snowball' | 'avalanche') => {
    setSelectedMethod(method);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white py-8">
      {shouldShowOnboarding && (
        <UserOnboarding onComplete={handleOnboardingComplete} subscriptionPlan={subscriptionPlan} />
      )}
      
      <div className="container mx-auto px-4">
        {/* Header Section with Subscription Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Welcome Back{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-gray-300">
              Track your progress and optimize your debt-free journey
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <SubscriptionBadge 
              status={subscriptionStatus as any}
              planName={subscriptionPlan}
            />
          </div>
        </motion.div>

        {/* Show upgrade prompt for free users */}
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 border border-amber-500/30 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/10"
          >
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex bg-amber-500/20 p-2 rounded-full">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 text-amber-400">Upgrade to Premium</h3>
                <p className="text-white/70 mb-3">Get access to advanced debt reduction strategies, unlimited accounts, and AI-powered insights.</p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    size="sm"
                  >
                    Upgrade Now
                  </Button>
                  <Button 
                    onClick={handleUpgradePromptClose}
                    variant="outline"
                    size="sm"
                    className="border-white/20"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-[#88B04B]" />
              </div>
              <h3 className="text-lg font-semibold">Total Debt</h3>
            </div>
            <p className="text-2xl font-bold text-[#88B04B]">$20,000</p>
            <p className="text-sm text-gray-400">-$1,500 this month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-[#88B04B]" />
              </div>
              <h3 className="text-lg font-semibold">Debt-Free Date</h3>
            </div>
            <p className="text-2xl font-bold text-white">March 2025</p>
            <p className="text-sm text-gray-400">36 months remaining</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-[#88B04B]" />
              </div>
              <h3 className="text-lg font-semibold">Interest Saved</h3>
            </div>
            <p className="text-2xl font-bold text-[#88B04B]">$3,450</p>
            <p className="text-sm text-gray-400">Using {selectedMethod} method</p>
          </motion.div>

          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-[#88B04B]" />
              </div>
              <h3 className="text-lg font-semibold">AI Insights</h3>
            </div>
            <p className="text-white font-medium">3 new recommendations</p>
            <p className="text-sm text-gray-400">View suggestions →</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Debt Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <PieChart className="w-5 h-5 text-[#88B04B]" />
                  <h2 className="text-xl font-semibold text-white">Debt Overview</h2>
                </div>
                <Button variant="outline" size="sm" className="text-[#88B04B] border-[#88B04B]">
                  Add Debt
                </Button>
              </div>
              <DebtOverview 
                debts={mockDebts} 
                isLoading={false}
                onDebtUpdate={() => {}}
              />
            </div>

            {/* Strategy Selection */}
            <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Payment Strategy</h2>
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={() => handleMethodChange('snowball')}
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedMethod === 'snowball'
                      ? 'bg-[#88B04B] text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Debt Snowball
                </Button>
                <Button
                  onClick={() => handleMethodChange('avalanche')}
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedMethod === 'avalanche'
                      ? 'bg-[#88B04B] text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Debt Avalanche
                </Button>
              </div>

              <div className="space-y-6">
                {currentScenario.debts.map((debt, index) => (
                  <div key={debt.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{debt.name}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>${debt.balance.toLocaleString()}</span>
                          <span>{debt.interestRate}% APR</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#88B04B] font-medium">
                          ${debt.monthlyPayment}/mo
                        </p>
                        <p className="text-sm text-white/60">
                          {debt.progress}% Paid
                        </p>
                      </div>
                    </div>
                    <ProgressBar 
                      progress={debt.progress} 
                      label="" 
                      color={`rgba(136, 176, 75, ${1 - index * 0.2})`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* AI Insights */}
            <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                <Bell className="w-5 h-5 text-[#88B04B]" />
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-5 h-5 text-[#88B04B]" />
                    <h3 className="font-medium text-white">Payment Optimization</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Increasing your Credit Card payment by $100/mo could save you $450 in interest.
                  </p>
                  <Button variant="outline" size="sm" className="text-[#88B04B] border-[#88B04B]">
                    Apply Suggestion
                  </Button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-5 h-5 text-[#88B04B]" />
                    <h3 className="font-medium text-white">Refinancing Opportunity</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    You may qualify for a 12% APR consolidation loan, saving $200/mo.
                  </p>
                  <Button variant="outline" size="sm" className="text-[#88B04B] border-[#88B04B]">
                    Learn More
                  </Button>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart2 className="w-5 h-5 text-[#88B04B]" />
                    <h3 className="font-medium text-white">Spending Pattern</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Reducing dining expenses by 20% could accelerate your debt payoff by 3 months.
                  </p>
                  <Button variant="outline" size="sm" className="text-[#88B04B] border-[#88B04B]">
                    View Analysis
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Progress Overview</h2>
              
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <CircularProgress 
                    progress={35}
                    size={192}
                    strokeWidth={16}
                    label="Overall Progress"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Monthly Goal</span>
                    <span className="text-[#88B04B]">$1,500/$2,000</span>
                  </div>
                  <ProgressBar progress={75} label="" color="#88B04B" />
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Interest Saved</span>
                    <span className="text-[#88B04B]">$3,450/$5,000</span>
                  </div>
                  <ProgressBar progress={69} label="" color="#88B04B" />
                </div>

                <Button className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white">
                  View Detailed Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Debt-Free Timeline */}
            <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-[#88B04B]" />
                <h2 className="text-xl font-semibold text-white">Debt-Free Timeline</h2>
              </div>
              {/* Add the timeline content here */}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}