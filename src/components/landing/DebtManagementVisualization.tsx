import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Calendar, 
  DollarSign, 
  Calculator, 
  Clock,
  Target,
  Sparkles,
  CreditCard,
  GraduationCap,
  Home,
  Car,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { CircularProgress } from '@/components/animations/CircularProgress';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Real average debt statistics from Federal Reserve (2023)
const DEBT_STATISTICS = {
  creditCard: { avg: 6000, rate: 24.99 },
  studentLoan: { avg: 37000, rate: 5.8 },
  autoLoan: { avg: 28000, rate: 7.5 },
  mortgage: { avg: 350000, rate: 6.8 }
};

// Calculate minimum payment for credit cards (typically 1-3% of balance + interest)
const calculateCreditCardMinPayment = (balance: number, rate: number) => {
  const monthlyRate = rate / 100 / 12;
  return Math.max(balance * 0.02 + (balance * monthlyRate), 25);
};

// Calculate mortgage payment using amortization formula
const calculateMortgagePayment = (principal: number, annualRate: number, years: number) => {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

// Dynamic payment scenarios based on debt type
const getPaymentScenarios = (debtType: string) => {
  const { avg, rate } = DEBT_STATISTICS[debtType as keyof typeof DEBT_STATISTICS];
  
  // Calculate scenarios based on debt type
  const scenarios = {
    creditCard: {
      minimum: {
        monthlyPayment: calculateCreditCardMinPayment(avg, rate),
        yearsToPayoff: 25
      },
      recommended: {
        monthlyPayment: Math.max(avg * 0.05 + (avg * rate / 100 / 12), calculateCreditCardMinPayment(avg, rate) * 2),
        yearsToPayoff: 3
      },
      aggressive: {
        monthlyPayment: Math.max(avg * 0.10 + (avg * rate / 100 / 12), calculateCreditCardMinPayment(avg, rate) * 3),
        yearsToPayoff: 1
      }
    },
    studentLoan: {
      minimum: {
        // Standard repayment plan (10 years)
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 120)) / 
                       (Math.pow(1 + rate / 100 / 12, 120) - 1),
        yearsToPayoff: 10
      },
      recommended: {
        // Income-based repayment equivalent (15 years)
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 180)) / 
                       (Math.pow(1 + rate / 100 / 12, 180) - 1) * 1.2,
        yearsToPayoff: 15
      },
      aggressive: {
        // Accelerated repayment (7 years)
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 84)) / 
                       (Math.pow(1 + rate / 100 / 12, 84) - 1),
        yearsToPayoff: 7
      }
    },
    autoLoan: {
      minimum: {
        // Standard 72-month auto loan
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 72)) / 
                       (Math.pow(1 + rate / 100 / 12, 72) - 1),
        yearsToPayoff: 6
      },
      recommended: {
        // Standard 60-month auto loan
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 60)) / 
                       (Math.pow(1 + rate / 100 / 12, 60) - 1),
        yearsToPayoff: 5
      },
      aggressive: {
        // Accelerated 36-month auto loan
        monthlyPayment: (avg * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 36)) / 
                       (Math.pow(1 + rate / 100 / 12, 36) - 1),
        yearsToPayoff: 3
      }
    },
    mortgage: {
      minimum: {
        // 30-year fixed mortgage
        monthlyPayment: calculateMortgagePayment(avg, rate, 30),
        yearsToPayoff: 30
      },
      recommended: {
        // 20-year fixed mortgage
        monthlyPayment: calculateMortgagePayment(avg, rate, 20),
        yearsToPayoff: 20
      },
      aggressive: {
        // 15-year fixed mortgage
        monthlyPayment: calculateMortgagePayment(avg, rate, 15),
        yearsToPayoff: 15
      }
    }
  };

  const typeScenarios = scenarios[debtType as keyof typeof scenarios];
  const result: Record<string, any> = {};

  // Calculate total interest and total paid for each scenario
  Object.entries(typeScenarios).forEach(([key, scenario]) => {
    const schedule = calculateAmortization(
      avg,
      rate,
      scenario.monthlyPayment,
      scenario.yearsToPayoff * 12
    );
    
    const totalPaid = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    const totalInterest = totalPaid - avg;

    result[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1) + " Payments",
      monthlyPayment: Math.round(scenario.monthlyPayment),
      totalInterest: Math.round(totalInterest),
      yearsToPayoff: scenario.yearsToPayoff,
      totalPaid: Math.round(totalPaid)
    };
  });

  return result;
};

const DEBT_TYPES = [
  {
    type: 'creditCard',
    label: 'Credit Cards',
    icon: CreditCard,
    color: '#FF6B6B',
    stats: {
      avgBalance: DEBT_STATISTICS.creditCard.avg,
      interestRate: DEBT_STATISTICS.creditCard.rate,
          monthlyPayment: 300,
      priorityLevel: 'Highest',
      recommendation: 'Pay more than minimum to avoid compound interest'
    }
  },
  {
    type: 'studentLoan',
    label: 'Student Loans',
    icon: GraduationCap,
    color: '#4ECDC4',
    stats: {
      avgBalance: DEBT_STATISTICS.studentLoan.avg,
      interestRate: DEBT_STATISTICS.studentLoan.rate,
      monthlyPayment: 400,
      priorityLevel: 'Medium',
      recommendation: 'Consider income-driven repayment plans'
    }
  },
  {
    type: 'autoLoan',
    label: 'Auto Loans',
    icon: Car,
    color: '#45B7D1',
    stats: {
      avgBalance: DEBT_STATISTICS.autoLoan.avg,
      interestRate: DEBT_STATISTICS.autoLoan.rate,
      monthlyPayment: 500,
      priorityLevel: 'Medium',
      recommendation: 'Refinance if your credit score has improved'
    }
  },
  {
    type: 'mortgage',
    label: 'Mortgage',
    icon: Home,
    color: '#96CEB4',
    stats: {
      avgBalance: DEBT_STATISTICS.mortgage.avg,
      interestRate: DEBT_STATISTICS.mortgage.rate,
      monthlyPayment: 2200,
      priorityLevel: 'Low',
      recommendation: 'Consider extra payments to principal'
    }
  }
];

interface PaymentPlan {
  month: number;
  balance: number;
  payment: number;
  interest: number;
  principal: number;
}

const calculateAmortization = (
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  months: number
): PaymentPlan[] => {
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  const schedule: PaymentPlan[] = [];

  for (let month = 1; month <= months && balance > 0; month++) {
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      balance,
      payment: monthlyPayment,
      interest,
      principal: principalPayment
    });
  }

  return schedule;
};

// Add formatCurrency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DebtManagementVisualization() {
  const [selectedPlan, setSelectedPlan] = useState<'minimum' | 'recommended' | 'aggressive'>('recommended');
  const [selectedDebtType, setSelectedDebtType] = useState<string>('creditCard');

  const selectedDebtInfo = DEBT_TYPES.find(debt => debt.type === selectedDebtType);
  const paymentScenarios = useMemo(() => getPaymentScenarios(selectedDebtType), [selectedDebtType]);
  const currentPlan = paymentScenarios[selectedPlan];

  const amortizationSchedule = useMemo(() => {
    const { avg, rate } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
    return calculateAmortization(
      avg,
      rate,
      currentPlan.monthlyPayment,
      currentPlan.yearsToPayoff * 12
    );
  }, [selectedPlan, selectedDebtType, currentPlan]);

  // Add hover state for chart points
  const [hoveredPoint, setHoveredPoint] = useState<PaymentPlan | null>(null);

  const chartData = useMemo(() => {
    // Get data for all three payment strategies for comparison
    const strategies = ['minimum', 'recommended', 'aggressive'];
    const allStrategiesData: any[] = [];
    
    // Max months across all strategies for consistent x-axis
    let maxMonths = 0;
    
    strategies.forEach(strategy => {
      const { avg, rate } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
      const scenarioData = paymentScenarios[strategy as keyof typeof paymentScenarios];
      
      const schedule = calculateAmortization(
        avg,
        rate,
        scenarioData.monthlyPayment,
        scenarioData.yearsToPayoff * 12
      );
      
      maxMonths = Math.max(maxMonths, schedule.length);
      
      schedule.forEach((point, index) => {
        // Create data point for each month if it doesn't exist
        if (!allStrategiesData[index]) {
          // Format month/year label more clearly
          const months = point.month;
          const years = Math.floor(months / 12);
          const remainingMonths = months % 12;
          
          let timeLabel;
          if (years === 0) {
            timeLabel = `${months}m`;
          } else if (remainingMonths === 0) {
            timeLabel = `${years}y`;
          } else if (months % 6 === 0) {
            timeLabel = `${years}y ${remainingMonths}m`;
          } else {
            // Only show certain intervals to avoid crowding
            timeLabel = "";
          }
          
          allStrategiesData[index] = {
            month: point.month,
            timeLabel,
            formattedTime: years > 0 ? 
              `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}` : 
              `${months} month${months > 1 ? 's' : ''}`,
          };
        }
        
        // Add data for this strategy
        allStrategiesData[index][`${strategy}Balance`] = point.balance;
        allStrategiesData[index][`${strategy}Payment`] = point.payment;
        allStrategiesData[index][`${strategy}Interest`] = point.interest;
        allStrategiesData[index][`${strategy}Principal`] = point.principal;
        allStrategiesData[index][`${strategy}Percentage`] = ((1 - point.balance / avg) * 100).toFixed(1);
      });
    });
    
    // Fill in missing data points with null for shorter schedules
    allStrategiesData.forEach((data, index) => {
      strategies.forEach(strategy => {
        if (data[`${strategy}Balance`] === undefined) {
          data[`${strategy}Balance`] = null;
          data[`${strategy}Payment`] = null;
          data[`${strategy}Interest`] = null;
          data[`${strategy}Principal`] = null;
          data[`${strategy}Percentage`] = null;
        }
      });
    });
    
    return allStrategiesData;
  }, [selectedDebtType, paymentScenarios]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl text-sm max-w-xs">
          <div className="font-semibold mb-2 text-white border-b border-white/20 pb-2">
            {data.formattedTime}
          </div>
          <div className="space-y-3">
            {['minimum', 'recommended', 'aggressive'].map(strategy => {
              if (data[`${strategy}Balance`] === null) return null;
              
              const strategyLabel = {
                'minimum': 'Minimum',
                'recommended': 'Recommended',
                'aggressive': 'Aggressive'
              }[strategy];
              
              const strategyColor = {
                'minimum': '#FF6B6B',
                'recommended': '#88B04B',
                'aggressive': '#4ECDC4'
              }[strategy];
              
              return (
                <div key={strategy} className="space-y-1">
                  <div className="font-medium text-white flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: strategyColor}}></div>
                    {strategyLabel} Plan
                  </div>
                  <div className="text-white/80 pl-5 text-xs flex justify-between">
                    <span>Balance:</span>
                    <span>{formatCurrency(data[`${strategy}Balance`])}</span>
                  </div>
                  <div className="text-white/80 pl-5 text-xs flex justify-between">
                    <span>Paid off:</span>
                    <span>{data[`${strategy}Percentage`]}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <LineChart className="w-4 h-4 text-[#88B04B]" />
            <span className="text-sm text-white/80">Real Debt Statistics & Analysis</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Understanding Your Debt Journey
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            Based on real Federal Reserve data, explore how different payment strategies affect your path to financial freedom.
          </p>
        </motion.div>

        {/* Debt Type Selection */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {DEBT_TYPES.map((debt) => {
            const Icon = debt.icon;
            const isSelected = selectedDebtType === debt.type;
            
            return (
              <motion.button
                key={debt.type}
                onClick={() => setSelectedDebtType(debt.type)}
                className={`relative p-6 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-[#88B04B]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                } text-left transition-all`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: `${debt.color}20` }}>
                    <Icon className="w-6 h-6 m-2" style={{ color: debt.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{debt.label}</h3>
                    <p className="text-sm text-white/60">Avg: ${debt.stats.avgBalance.toLocaleString()}</p>
                  </div>
            </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/80">{debt.stats.interestRate}% APR</span>
                  {isSelected && (
                    <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                      className="px-2 py-1 rounded-full bg-[#88B04B]/20 text-[#88B04B] text-xs"
                    >
                      Selected
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
          </div>

        {/* Debt Details */}
        {selectedDebtInfo && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 mb-12 border border-white/10"
          >
            <div className="grid md:grid-cols-2 gap-8">
                    <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <selectedDebtInfo.icon className="w-5 h-5" style={{ color: selectedDebtInfo.color }} />
                  {selectedDebtInfo.label} Analysis
                  </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Average Balance</span>
                    <span className="text-white font-medium">${selectedDebtInfo.stats.avgBalance.toLocaleString()}</span>
                        </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Interest Rate</span>
                    <span className="text-white font-medium">{selectedDebtInfo.stats.interestRate}% APR</span>
                      </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Typical Monthly Payment</span>
                    <span className="text-white font-medium">${selectedDebtInfo.stats.monthlyPayment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Priority Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedDebtInfo.stats.priorityLevel === 'Highest' 
                        ? 'bg-red-500/20 text-red-400'
                        : selectedDebtInfo.stats.priorityLevel === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedDebtInfo.stats.priorityLevel}
                    </span>
                              </div>
                            </div>
                          </div>
              <div className="border-l border-white/10 pl-8">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#88B04B]" />
                  Smart Recommendations
                </h4>
                <p className="text-white/80 leading-relaxed">
                  {selectedDebtInfo.stats.recommendation}
                </p>
                <div className="mt-6 p-4 bg-[#88B04B]/10 rounded-lg border border-[#88B04B]/20">
                  <h5 className="text-[#88B04B] font-medium mb-2">Impact of Extra Payments</h5>
                  <p className="text-sm text-white/80">
                    Adding $100/month to your payment could save you ${(selectedDebtInfo.stats.avgBalance * selectedDebtInfo.stats.interestRate / 100 * 0.2).toFixed(0)} in interest and reduce your repayment time by {Math.round(selectedDebtInfo.stats.interestRate * 0.4)} months.
                            </p>
                          </div>
                        </div>
                        </div>
                      </motion.div>
        )}

        {/* Payment Strategy Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.entries(paymentScenarios).map(([key, plan]) => {
            const isSelected = selectedPlan === key;
            return (
              <motion.button
                key={key}
                onClick={() => setSelectedPlan(key as any)}
                className={`p-6 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-[#88B04B]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                } text-left transition-all`}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4">{plan.label}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Monthly Payment</span>
                    <span className="text-white font-medium">${plan.monthlyPayment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Years to Payoff</span>
                    <span className="text-white font-medium">{plan.yearsToPayoff} years</span>
                </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Total Interest</span>
                    <span className="text-white font-medium">${plan.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10 my-3" />
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-white/80">Total Paid</span>
                    <span className="text-[#88B04B]">${plan.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </motion.button>
                    );
                  })}
                </div>

        {/* Amortization Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#88B04B]" />
              Payment Progress Comparison
            </h3>
            
            <div className="flex items-center gap-3 mt-3 md:mt-0 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                <span className="text-white/80">Minimum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#88B04B]" />
                <span className="text-white/80">Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
                <span className="text-white/80">Aggressive</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="minimumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="recommendedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#88B04B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#88B04B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="aggressiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)"
                  vertical={false}
                />
                
                <XAxis
                  dataKey="timeLabel"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  label={{ 
                    value: 'Time', 
                    position: 'bottom',
                    fill: 'rgba(255,255,255,0.5)',
                    offset: -5
                  }}
                />
                
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickFormatter={(value) => `$${value > 999 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  label={{ 
                    value: 'Balance', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: 'rgba(255,255,255,0.5)',
                    offset: 10
                  }}
                />
                
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                
                <Area
                  type="monotone"
                  dataKey="minimumBalance"
                  stroke="#FF6B6B"
                  strokeWidth={selectedPlan === 'minimum' ? 3 : 2}
                  strokeOpacity={selectedPlan === 'minimum' ? 1 : 0.7}
                  fill="url(#minimumGradient)"
                  fillOpacity={selectedPlan === 'minimum' ? 1 : 0.7}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#FF6B6B",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                
                <Area
                  type="monotone"
                  dataKey="recommendedBalance"
                  stroke="#88B04B"
                  strokeWidth={selectedPlan === 'recommended' ? 3 : 2}
                  strokeOpacity={selectedPlan === 'recommended' ? 1 : 0.7}
                  fill="url(#recommendedGradient)"
                  fillOpacity={selectedPlan === 'recommended' ? 1 : 0.7}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#88B04B",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                
                <Area
                  type="monotone"
                  dataKey="aggressiveBalance"
                  stroke="#4ECDC4"
                  strokeWidth={selectedPlan === 'aggressive' ? 3 : 2}
                  strokeOpacity={selectedPlan === 'aggressive' ? 1 : 0.7}
                  fill="url(#aggressiveGradient)"
                  fillOpacity={selectedPlan === 'aggressive' ? 1 : 0.7}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#4ECDC4",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 bg-black/30 rounded-xl p-4 border border-white/10">
            <div className="grid grid-cols-3 gap-4">
              {['minimum', 'recommended', 'aggressive'].map(strategy => {
                const strategyData = paymentScenarios[strategy as keyof typeof paymentScenarios];
                const isSelected = selectedPlan === strategy;
                
                return (
                  <div 
                    key={strategy}
                    className={`p-3 rounded-lg ${isSelected ? 'bg-white/10 ring-2 ring-offset-2 ring-offset-black/50 ring-white/20' : 'bg-black/20'} transition-all`}
                  >
                    <div className="text-xs font-medium mb-2 text-white/70">
                      With {strategyData.label}:
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/60">Total paid:</span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(strategyData.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">Time to freedom:</span>
                      <span className="text-sm font-semibold text-white">{strategyData.yearsToPayoff} years</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}