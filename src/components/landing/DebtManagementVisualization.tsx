import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Calendar, 
  DollarSign, 
  Calculator, 
  Clock,
  ChevronRight,
  Target,
  Zap,
  Shield,
  CheckCircle,
  ArrowUpRight,
  Sparkles
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

  const methodFeatures = {
    snowball: [
      { icon: Target, title: "Small Wins First", description: "Focus on smallest debts for quick victories" },
      { icon: Zap, title: "Motivation Boost", description: "Build momentum with each debt paid off" },
      { icon: Shield, title: "Simple Strategy", description: "Easy to follow and maintain" }
    ],
    avalanche: [
      { icon: Calculator, title: "Maximum Savings", description: "Minimize total interest paid over time" },
      { icon: Target, title: "Strategic Approach", description: "Target highest-interest debts first" },
      { icon: Shield, title: "Optimal Efficiency", description: "Mathematically optimal solution" }
    ]
  };

  return (
    <motion.section 
      className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-black/40 to-transparent"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] rounded-full blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-r from-[#6A9A2D] to-[#88B04B] rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-[#88B04B]" />
            <span className="text-sm text-white/80">AI-Powered Strategy Selection</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Choose Your Path to Freedom
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Two powerful strategies, one goal: your financial freedom. Our AI analyzes your situation to recommend the best approach.
          </p>

          {/* Enhanced Method Selection */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Button
                  onClick={() => handleMethodChange('snowball')}
                  className={`group relative px-8 py-4 rounded-xl transition-all ${
                    selectedMethod === 'snowball'
                      ? 'bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white shadow-lg shadow-[#88B04B]/20'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  } w-full sm:w-auto overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#88B04B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-semibold">Debt Snowball</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Button
                  onClick={() => handleMethodChange('avalanche')}
                  className={`group relative px-8 py-4 rounded-xl transition-all ${
                    selectedMethod === 'avalanche'
                      ? 'bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white shadow-lg shadow-[#88B04B]/20'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  } w-full sm:w-auto overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#88B04B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <span className="font-semibold">Debt Avalanche</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/5 via-transparent to-transparent rounded-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  {selectedMethod === 'snowball' ? (
                    <TrendingDown className="w-5 h-5 text-[#88B04B]" />
                  ) : (
                    <Wallet className="w-5 h-5 text-[#88B04B]" />
                  )}
                  <h4 className="text-lg font-semibold text-white">
                    {selectedMethod === 'snowball' ? 'Snowball Strategy' : 'Avalanche Strategy'}
                  </h4>
                </div>
                <p className="text-gray-300 text-base">
                  {selectedMethod === 'snowball' 
                    ? 'The Snowball method focuses on paying off your smallest debts first, giving you quick wins and motivation to keep going.'
                    : 'The Avalanche method targets high-interest debts first, minimizing the total interest you\'ll pay over time.'}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Enhanced Left Column - Strategy Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isAnimating ? 0 : 1, x: isAnimating ? -20 : 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Enhanced Strategy Overview */}
              <motion.div 
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden transform hover:scale-[1.02] transition-transform"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/5 via-[#88B04B]/2 to-transparent" />
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
                
                <div className="relative">
                  <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center shadow-lg">
                      {selectedMethod === 'snowball' ? (
                        <TrendingDown className="w-6 h-6 text-[#88B04B]" />
                      ) : (
                        <Wallet className="w-6 h-6 text-[#88B04B]" />
                      )}
                    </div>
                    <div>
                      {selectedMethod === 'snowball' ? 'Debt Snowball Method' : 'Debt Avalanche Method'}
                      <p className="text-sm text-gray-400 font-normal mt-1">
                        {selectedMethod === 'snowball' 
                          ? 'Build momentum with quick wins'
                          : 'Optimize interest savings'}
                      </p>
                    </div>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <motion.div 
                      className="group bg-white/5 p-6 rounded-xl border border-white/10 transform hover:scale-[1.03] transition-all hover:border-[#88B04B]/30"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <DollarSign className="w-5 h-5 text-[#88B04B]" />
                        </div>
                        <span className="text-white/70">Total Interest</span>
                      </div>
                      <motion.p 
                        key={currentScenario.totalInterestPaid}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        ${currentScenario.totalInterestPaid.toLocaleString()}
                      </motion.p>
                    </motion.div>
                    
                    <motion.div 
                      className="group bg-white/5 p-6 rounded-xl border border-white/10 transform hover:scale-[1.03] transition-all hover:border-[#88B04B]/30"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5 text-[#88B04B]" />
                        </div>
                        <span className="text-white/70">Time to Freedom</span>
                      </div>
                      <motion.p 
                        key={currentScenario.monthsToDebtFree}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {currentScenario.monthsToDebtFree} months
                      </motion.p>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {currentScenario.debts.map((debt, index) => (
                      <motion.div 
                        key={debt.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <DollarSign className="w-5 h-5 text-[#88B04B]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{debt.name}</p>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span>${debt.balance.toLocaleString()}</span>
                                <span>{debt.interestRate}% APR</span>
                              </div>
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
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#88B04B]/20 to-transparent rounded-full blur-[2px]" />
                          <ProgressBar 
                            progress={debt.progress} 
                            label="" 
                            color={`rgba(136, 176, 75, ${1 - index * 0.2})`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Method Features */}
              <div className="grid grid-cols-3 gap-4">
                {methodFeatures[selectedMethod].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#88B04B]/30 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6 text-[#88B04B]" />
                      </div>
                      <h4 className="text-white font-medium mb-2">{feature.title}</h4>
                      <p className="text-sm text-white/60">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Right Column - Visual Insights */}
          <div className="space-y-8">
            {/* Enhanced Debt Distribution */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden transform hover:scale-[1.02] transition-transform"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#88B04B]/5 via-[#88B04B]/2 to-transparent" />
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center shadow-lg">
                    <PieChart className="w-6 h-6 text-[#88B04B]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Payment Distribution</h3>
                    <p className="text-sm text-gray-400">How your payments are allocated</p>
                  </div>
                </div>

                <div className="flex justify-center mb-8">
                  <motion.div 
                    className="relative w-48 h-48"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CircularProgress 
                      progress={Math.round(
                        (currentScenario.debts.reduce((acc, debt) => acc + (debt.progress * debt.balance), 0) / 
                        currentScenario.debts.reduce((acc, debt) => acc + debt.balance, 0))
                      )}
                      size={192}
                      strokeWidth={16}
                      label="Overall Progress"
                    />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  {currentScenario.debts.map((debt, index) => {
                    const totalDebt = currentScenario.debts.reduce((acc, d) => acc + d.balance, 0);
                    const percentage = Math.round((debt.balance / totalDebt) * 100);
                    
                    return (
                      <motion.div
                        key={debt.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full" style={{ 
                            backgroundColor: `rgba(136, 176, 75, ${1 - index * 0.2})` 
                          }} />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium">{debt.name}</p>
                              <p className="text-[#88B04B]">${debt.balance.toLocaleString()}</p>
                            </div>
                            <p className="text-sm text-white/60">{percentage}% of total debt</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Strategy Comparison */}
            <motion.div 
              className="bg-gradient-to-br from-[#88B04B]/10 to-[#6A9A2D]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#88B04B]/30 transform hover:scale-[1.02] transition-transform"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center shadow-lg">
                  <Calculator className="w-6 h-6 text-[#88B04B]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Strategy Impact</h3>
                  <p className="text-sm text-gray-400">Compare method effectiveness</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-5 h-5 text-[#88B04B]" />
                      </div>
                      <p className="text-white/70">Interest Savings</p>
                    </div>
                    <motion.p 
                      key={interestSavings}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-[#88B04B]"
                    >
                      ${Math.abs(interestSavings).toLocaleString()}
                    </motion.p>
                    <p className="text-sm text-white/60 mt-1">
                      vs. {selectedMethod === 'snowball' ? 'Avalanche' : 'Snowball'}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5 text-[#88B04B]" />
                      </div>
                      <p className="text-white/70">Time Difference</p>
                    </div>
                    <motion.p 
                      key={timeSavings}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-[#88B04B]"
                    >
                      {Math.abs(timeSavings)} months
                    </motion.p>
                    <p className="text-sm text-white/60 mt-1">
                      {timeSavings > 0 ? 'Longer' : 'Faster'} than alternative
                    </p>
                  </motion.div>
                </div>

                <motion.div 
                  className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#88B04B]/20 to-[#6A9A2D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-[#88B04B]" />
                    </div>
                    <p className="text-white font-medium">Projected Completion</p>
                  </div>
                  <motion.p 
                    key={currentScenario.monthsToDebtFree}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg text-white"
                  >
                    {new Date(Date.now() + (currentScenario.monthsToDebtFree * 30 * 24 * 60 * 60 * 1000))
                      .toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long'
                      })}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}