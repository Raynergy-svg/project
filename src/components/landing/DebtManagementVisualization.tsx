import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard,
  GraduationCap,
  Home,
  Car,
  LineChart,
  Info
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Real average debt statistics from Federal Reserve (2023)
const DEBT_STATISTICS = {
  creditCard: { avg: 6000, rate: 24.99 },
  studentLoan: { avg: 37000, rate: 5.8 },
  autoLoan: { avg: 28000, rate: 7.5 },
  mortgage: { avg: 350000, rate: 6.8 }
};

/**
 * Calculate minimum payment for credit cards based on industry standards
 */
const calculateCreditCardMinPayment = (balance: number, rate: number): number => {
  if (balance <= 0) return 0;
  const monthlyRate = rate / 100 / 12;
  const interestAmount = balance * monthlyRate;
  const percentOfBalance = balance * 0.02; // 2% of balance is typical minimum
  return Math.max(interestAmount + percentOfBalance, 25); // Minimum $25 payment
};

/**
 * Calculate mortgage payment using the standard amortization formula
 */
const calculateMortgagePayment = (principal: number, annualRate: number, years: number): number => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

/**
 * Calculate student loan payment using the standard amortization formula
 */
const calculateStudentLoanPayment = (principal: number, annualRate: number, years: number): number => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

/**
 * Calculate auto loan payment using the standard amortization formula
 */
const calculateAutoLoanPayment = (principal: number, annualRate: number, years: number): number => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

/**
 * Generate payment scenarios based on debt type
 */
const getPaymentScenarios = (debtType: string) => {
  const { avg, rate } = DEBT_STATISTICS[debtType as keyof typeof DEBT_STATISTICS];
  
  let scenarios: Record<string, { monthlyPayment: number, yearsToPayoff: number }>;
  
  switch (debtType) {
    case 'creditCard':
      scenarios = {
        minimum: {
          monthlyPayment: calculateCreditCardMinPayment(avg, rate),
          yearsToPayoff: 25
        },
        recommended: {
          monthlyPayment: Math.max(avg * 0.05, calculateCreditCardMinPayment(avg, rate) * 2),
          yearsToPayoff: 3
        },
        aggressive: {
          monthlyPayment: Math.max(avg * 0.10, calculateCreditCardMinPayment(avg, rate) * 3),
          yearsToPayoff: 1
        }
      };
      break;
      
    case 'studentLoan':
      scenarios = {
        minimum: {
          monthlyPayment: calculateStudentLoanPayment(avg, rate, 10),
          yearsToPayoff: 10
        },
        recommended: {
          monthlyPayment: calculateStudentLoanPayment(avg, rate, 8),
          yearsToPayoff: 8
        },
        aggressive: {
          monthlyPayment: calculateStudentLoanPayment(avg, rate, 5),
          yearsToPayoff: 5
        }
      };
      break;
      
    case 'autoLoan':
      scenarios = {
        minimum: {
          monthlyPayment: calculateAutoLoanPayment(avg, rate, 6),
          yearsToPayoff: 6
        },
        recommended: {
          monthlyPayment: calculateAutoLoanPayment(avg, rate, 5),
          yearsToPayoff: 5
        },
        aggressive: {
          monthlyPayment: calculateAutoLoanPayment(avg, rate, 3),
          yearsToPayoff: 3
        }
      };
      break;
      
    case 'mortgage':
      scenarios = {
        minimum: {
          monthlyPayment: calculateMortgagePayment(avg, rate, 30),
          yearsToPayoff: 30
        },
        recommended: {
          monthlyPayment: calculateMortgagePayment(avg, rate, 20),
          yearsToPayoff: 20
        },
        aggressive: {
          monthlyPayment: calculateMortgagePayment(avg, rate, 15),
          yearsToPayoff: 15
        }
      };
      break;
      
    default:
      scenarios = {
        minimum: { monthlyPayment: avg * 0.02, yearsToPayoff: 10 },
        recommended: { monthlyPayment: avg * 0.03, yearsToPayoff: 5 },
        aggressive: { monthlyPayment: avg * 0.05, yearsToPayoff: 3 }
      };
  }

  const result: Record<string, any> = {};

  Object.entries(scenarios).forEach(([key, scenario]) => {
    const schedule = calculateAmortization(
      avg,
      rate,
      scenario.monthlyPayment,
      Math.ceil(scenario.yearsToPayoff * 12)
    );
    
    const totalPaid = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    const totalInterest = totalPaid - avg;
    
    result[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1) + " Payments",
      monthlyPayment: Math.round(scenario.monthlyPayment),
      totalInterest: Math.round(totalInterest),
      yearsToPayoff: scenario.yearsToPayoff,
      totalPaid: Math.round(totalPaid),
      monthlySavings: key !== "minimum" ? Math.round(scenarios.minimum.monthlyPayment * (scenarios.minimum.yearsToPayoff * 12) - totalPaid) : 0
    };
  });

  return result;
};

// Debt types with metadata
const DEBT_TYPES = [
  {
    type: 'creditCard',
    label: 'Credit Cards',
    icon: CreditCard,
    color: '#FF6B6B',
    stats: {
      avgBalance: DEBT_STATISTICS.creditCard.avg,
      interestRate: DEBT_STATISTICS.creditCard.rate,
      monthlyPayment: Math.round(calculateCreditCardMinPayment(DEBT_STATISTICS.creditCard.avg, DEBT_STATISTICS.creditCard.rate)),
      priorityLevel: 'Highest',
      recommendation: 'Pay more than the minimum payment to avoid excessive interest. Consider consolidating with a balance transfer card or personal loan.'
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
      monthlyPayment: Math.round(calculateStudentLoanPayment(DEBT_STATISTICS.studentLoan.avg, DEBT_STATISTICS.studentLoan.rate, 10)),
      priorityLevel: 'Medium',
      recommendation: "Consider income-driven repayment plans if you're struggling. Target high-interest unsubsidized loans first."
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
      monthlyPayment: Math.round(calculateAutoLoanPayment(DEBT_STATISTICS.autoLoan.avg, DEBT_STATISTICS.autoLoan.rate, 5)),
      priorityLevel: 'Medium',
      recommendation: 'Refinance if your credit score has improved since taking out the loan. Consider paying bi-weekly to reduce interest.'
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
      monthlyPayment: Math.round(calculateMortgagePayment(DEBT_STATISTICS.mortgage.avg, DEBT_STATISTICS.mortgage.rate, 30)),
      priorityLevel: 'Low',
      recommendation: 'Consider making one extra payment per year to reduce your loan term and save on interest. Refinance if rates drop significantly.'
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

/**
 * Calculate complete amortization schedule for a loan
 */
const calculateAmortization = (
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  months: number
): PaymentPlan[] => {
  if (principal <= 0 || months <= 0) {
    return [{ month: 0, balance: 0, payment: 0, interest: 0, principal: 0 }];
  }

  const monthlyRate = annualRate / 100 / 12;
  let remainingBalance = principal;
  const result: PaymentPlan[] = [];

  // Ensure monthly payment is at least the interest on the principal
  const minPayment = principal * monthlyRate;
  if (monthlyPayment < minPayment) {
    monthlyPayment = minPayment * 1.01; // Slightly more than interest only
  }

  for (let month = 1; month <= months && remainingBalance > 0; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(remainingBalance, monthlyPayment - interestPayment);
    
    // In case of rounding errors
    if (principalPayment <= 0 && remainingBalance < monthlyPayment) {
      result.push({
        month,
        balance: 0,
        payment: remainingBalance + interestPayment,
        interest: interestPayment,
        principal: remainingBalance
      });
      break;
    }
    
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    
    result.push({
      month,
      balance: remainingBalance,
      payment: interestPayment + principalPayment,
      interest: interestPayment,
      principal: principalPayment
    });
    
    // If balance is very close to zero, consider it paid off
    if (remainingBalance < 0.01) {
      remainingBalance = 0;
      break;
    }
  }
  
  return result;
};

/**
 * Format a number as currency with appropriate separators and decimal places
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DebtManagementVisualization: React.FC = () => {
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

  // Generate chart data for all three payment strategies
  const chartData = useMemo(() => {
    const { avg, rate } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
    
    // Just for the selected debt type, not longest overall
    const maxYears = Math.max(...Object.values(paymentScenarios).map(plan => plan.yearsToPayoff));
    
    // Create 12 to 20 data points for a smooth curve but not too many
    const numPoints = Math.min(Math.max(12, maxYears * 4), 20);
    const data = [];
    
    // Create data points at regular intervals
    for (let i = 0; i <= numPoints; i++) {
      const yearFraction = (i / numPoints) * maxYears;
      const month = Math.floor(yearFraction * 12);
      
      const dataPoint: any = {
        year: Math.round(yearFraction * 10) / 10, // Round to 1 decimal place
      };
      
      // Calculate balance for each strategy at this point in time
      Object.entries(paymentScenarios).forEach(([key, plan]) => {
        if (month <= plan.yearsToPayoff * 12) {
          const schedule = calculateAmortization(
            avg,
            rate,
            plan.monthlyPayment,
            month > 0 ? month : 1 // Ensure we have at least 1 month for calculation
          );
          
          // Get the latest balance from the amortization schedule
          const currentBalance = schedule.length > 0 ? schedule[schedule.length - 1].balance : avg;
          
          // Add balance to the data point
          dataPoint[`${key}Balance`] = currentBalance > 0 ? currentBalance : 0;
        } else {
          // If this time is beyond the payoff date, set balance to 0
          dataPoint[`${key}Balance`] = 0;
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  }, [selectedDebtType, paymentScenarios]);

  // Add this useEffect for debugging if needed
  // useEffect(() => {
  //   console.log('Chart Data:', chartData);
  //   console.log('Debt Type:', selectedDebtType);
  //   console.log('Payment Scenarios:', paymentScenarios);
  // }, [chartData, selectedDebtType, paymentScenarios]);

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          className="text-center mb-12"
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
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {DEBT_TYPES.map((debt) => {
            const Icon = debt.icon;
            const isSelected = selectedDebtType === debt.type;
            
            return (
              <motion.button
                key={debt.type}
                onClick={() => setSelectedDebtType(debt.type)}
                className={`relative p-4 sm:p-6 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-[#88B04B]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                } text-left transition-all`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-2">
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

        {/* Two-column layout for chart and payment strategies */}
        <div className="grid lg:grid-cols-12 gap-8 mb-8">
          {/* Chart column - takes 8/12 of the grid on large screens */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 order-2 lg:order-1"
          >
            {/* Original visualization chart */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#88B04B]" />
                Payment Progress Comparison
              </h3>
              
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="year" 
                      label={{ 
                        value: 'Years', 
                        position: 'insideBottomRight', 
                        offset: -10,
                        fill: '#aaa'
                      }}
                      tick={{ fill: '#aaa' }}
                      domain={[0, 'dataMax']}
                      tickCount={6}
                      interval={0}
                      tickFormatter={(value) => value % 1 === 0 ? value : value.toFixed(1)}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Balance ($)', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#aaa'
                      }}
                      tick={{ fill: '#aaa' }}
                      tickFormatter={tick => {
                        const { avg } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
                        if (avg >= 100000) {
                          return `$${(tick / 1000).toFixed(0)}k`;
                        } else if (avg >= 10000) {
                          return `$${(tick / 1000).toFixed(1)}k`;
                        } else {
                          return `$${tick.toFixed(0)}`;
                        }
                      }}
                      domain={[0, DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS].avg]}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
                        'Remaining Balance'
                      ]}
                      labelFormatter={(label) => 
                        label % 1 === 0 
                          ? `${label} ${label === 1 ? 'year' : 'years'}`
                          : `${Math.floor(label)} ${Math.floor(label) === 1 ? 'year' : 'years'}, ${Math.round((label % 1) * 12)} months`
                      }
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#fff'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="minimumBalance"
                      name="Minimum Payments"
                      stroke="#FF6B6B"
                      strokeWidth={selectedPlan === 'minimum' ? 3 : 2}
                      fill="#FF6B6B"
                      fillOpacity={0.2}
                      activeDot={selectedPlan === 'minimum' ? { r: 8, stroke: "#fff", strokeWidth: 2 } : false}
                      isAnimationActive={true}
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="recommendedBalance"
                      name="Recommended Payments"
                      stroke="#88B04B"
                      strokeWidth={selectedPlan === 'recommended' ? 3 : 2}
                      fill="#88B04B"
                      fillOpacity={0.2}
                      activeDot={selectedPlan === 'recommended' ? { r: 8, stroke: "#fff", strokeWidth: 2 } : false}
                      isAnimationActive={true}
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="aggressiveBalance"
                      name="Aggressive Payments"
                      stroke="#4ECDC4"
                      strokeWidth={selectedPlan === 'aggressive' ? 3 : 2}
                      fill="#4ECDC4"
                      fillOpacity={0.2}
                      activeDot={selectedPlan === 'aggressive' ? { r: 8, stroke: "#fff", strokeWidth: 2 } : false}
                      isAnimationActive={true}
                    />
                    
                    <defs>
                      <linearGradient id="minimumColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="recommendedColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#88B04B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#88B04B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="aggressiveColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(value, entry) => {
                        const { color } = entry as any;
                        return <span style={{ color: '#fff', marginRight: '10px' }}>{value}</span>;
                      }}
                      onClick={(data) => {
                        // When legend is clicked, change the selected plan
                        const dataKey = (data as any).dataKey;
                        if (dataKey.includes('minimum')) {
                          setSelectedPlan('minimum');
                        } else if (dataKey.includes('recommended')) {
                          setSelectedPlan('recommended');
                        } else if (dataKey.includes('aggressive')) {
                          setSelectedPlan('aggressive');
                        }
                      }}
                      wrapperStyle={{ paddingBottom: '10px' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
          
          {/* Payment strategies column - takes 4/12 of the grid on large screens */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            {/* Payment Strategy Selection */}
            <div className="grid lg:grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {Object.entries(paymentScenarios).map(([key, plan]) => {
                const isSelected = selectedPlan === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedPlan(key as any)}
                    className={`p-4 rounded-xl border ${
                      isSelected 
                        ? 'bg-white/10 border-[#88B04B]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    } text-left transition-all`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{plan.label}</h3>
                    <div className="space-y-2">
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
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-white/80">Total Paid</span>
                        <span className="text-[#88B04B]">${plan.totalPaid.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add extra spacing before the debt details section */}
        <div className="mt-16"></div>

        {/* Debt Details - moved below the chart with more spacing */}
        {selectedDebtInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10"
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
              <div className="md:border-l border-white/10 md:pl-8">
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
      </div>
    </section>
  );
};

export default DebtManagementVisualization;