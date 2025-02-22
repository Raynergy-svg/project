import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Calendar, 
  DollarSign, 
  Calculator, 
  Clock 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { ProgressBar } from '@/components/animations/ProgressBar';
import { CircularProgress } from '@/components/animations/CircularProgress';
import { Button } from '@/components/ui/button';

interface DebtScenario {
  method: 'snowball' | 'avalanche';
  totalInterestPaid: number;
  monthsToDebtFree: number;
  debts: {
    name: string;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
    progress: number;
  }[];
}

// Export as default for proper lazy loading
export default function DebtManagementVisualization() {
  const [selectedMethod, setSelectedMethod] = useState<'snowball' | 'avalanche'>('snowball');
  const [isAnimating, setIsAnimating] = useState(false);

  const scenarios: Record<'snowball' | 'avalanche', DebtScenario> = useMemo(() => ({
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
        },
        {
          name: 'Student Loan',
          balance: 15000,
          interestRate: 5.99,
          monthlyPayment: 150,
          progress: 5
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
        },
        {
          name: 'Student Loan',
          balance: 15000,
          interestRate: 5.99,
          monthlyPayment: 50,
          progress: 10
        }
      ]
    }
  }), []);

  const currentScenario = scenarios[selectedMethod];
  const otherScenario = scenarios[selectedMethod === 'snowball' ? 'avalanche' : 'snowball'];
  const interestSavings = currentScenario.totalInterestPaid - otherScenario.totalInterestPaid;
  const timeSavings = currentScenario.monthsToDebtFree - otherScenario.monthsToDebtFree;

  const handleMethodChange = (method: 'snowball' | 'avalanche') => {
    setIsAnimating(true);
    setSelectedMethod(method);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Methods For Your Debt-Free Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Choose between two proven debt management strategies, each with its own unique approach to helping you become debt-free
          </p>

          {/* Method Selection */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex justify-center gap-4">
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
            <p className="text-gray-300 text-center max-w-2xl">
              {selectedMethod === 'snowball' 
                ? 'The Snowball method focuses on paying off your smallest debts first, giving you quick wins and motivation to keep going.'
                : 'The Avalanche method targets high-interest debts first, minimizing the total interest you\'ll pay over time.'}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Strategy Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isAnimating ? 0 : 1, x: isAnimating ? -20 : 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Strategy Overview */}
              <div className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  {selectedMethod === 'snowball' ? 'Debt Snowball Method' : 'Debt Avalanche Method'}
                </h3>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-[#88B04B]" />
                      <span className="text-white/70">Total Interest</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${currentScenario.totalInterestPaid.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[#88B04B]" />
                      <span className="text-white/70">Time to Debt-Free</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {currentScenario.monthsToDebtFree} months
                    </p>
                  </div>
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

              {/* Comparison Card */}
              <div className="bg-[#88B04B]/10 rounded-xl p-6 border border-[#88B04B]/30">
                <div className="flex items-start gap-4">
                  <div className="bg-[#88B04B]/20 p-3 rounded-lg">
                    <Calculator className="w-6 h-6 text-[#88B04B]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      Strategy Comparison
                    </h4>
                    <div className="space-y-3">
                      <p className="text-white/80">
                        <span className="text-[#88B04B] font-medium">
                          ${Math.abs(interestSavings).toLocaleString()}
                        </span>{' '}
                        {interestSavings > 0 ? 'more' : 'less'} in total interest paid
                      </p>
                      <p className="text-white/80">
                        <span className="text-[#88B04B] font-medium">
                          {Math.abs(timeSavings)}
                        </span>{' '}
                        {timeSavings > 0 ? 'more' : 'less'} months to become debt-free
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Column - Visual Insights */}
          <div className="space-y-8">
            {/* Debt Distribution */}
            <motion.div 
              className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                  <PieChart className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Debt Distribution
                </h3>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <CircularProgress 
                    progress={Math.round(
                      (currentScenario.debts.reduce((acc, debt) => acc + (debt.progress * debt.balance), 0) / 
                      currentScenario.debts.reduce((acc, debt) => acc + debt.balance, 0))
                    )}
                    size={192}
                    strokeWidth={16}
                    label="Overall Progress"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {currentScenario.debts.map((debt) => {
                  const totalDebt = currentScenario.debts.reduce((acc, d) => acc + d.balance, 0);
                  const percentage = Math.round((debt.balance / totalDebt) * 100);
                  
                  return (
                    <div key={debt.name} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ 
                          backgroundColor: `rgba(136, 176, 75, ${debt.progress / 100})` 
                        }} />
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium">{debt.name}</p>
                            <p className="text-white/60">${debt.balance.toLocaleString()}</p>
                          </div>
                          <p className="text-white/60 text-sm">{percentage}% of total debt</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Time to Freedom */}
            <motion.div 
              className="bg-[#2A2A2A] rounded-xl p-8 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#88B04B]/20 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Debt-Free Timeline
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/70 mb-2">Estimated Completion Date</p>
                  <p className="text-2xl font-bold text-white">
                    {new Date(Date.now() + (currentScenario.monthsToDebtFree * 30 * 24 * 60 * 60 * 1000))
                      .toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long'
                      })}
                  </p>
                </div>

                <div className="p-4 bg-[#88B04B]/10 rounded-lg border border-[#88B04B]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-5 h-5 text-[#88B04B]" />
                    <p className="text-white font-medium">Required Monthly Payment</p>
                  </div>
                  <p className="text-3xl font-bold text-[#88B04B]">
                    ${currentScenario.debts.reduce((acc, debt) => acc + debt.monthlyPayment, 0)}/mo
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Total monthly payment to clear your debt
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}