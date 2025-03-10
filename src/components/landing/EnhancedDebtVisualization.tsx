import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, CreditCard, Home, GraduationCap, Car, DollarSign, Percent, Clock, TrendingDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts with no SSR to prevent hydration issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Debt types with their icons and labels
const DEBT_TYPES = [
  { id: 'creditCard', name: 'Credit Card', icon: CreditCard },
  { id: 'mortgage', name: 'Mortgage', icon: Home },
  { id: 'studentLoan', name: 'Student Loan', icon: GraduationCap },
  { id: 'autoLoan', name: 'Auto Loan', icon: Car },
];

// Sample debt statistics based on Federal Reserve data
const DEBT_STATISTICS = {
  creditCard: {
    avg: 6000,
    rate: 0.1899,
    description: 'The average American carries around $6,000 in credit card debt with interest rates averaging 18.99% APR.'
  },
  mortgage: {
    avg: 250000,
    rate: 0.0699,
    description: 'The average mortgage balance is $250,000 with interest rates averaging 6.99% for a 30-year fixed rate mortgage.'
  },
  studentLoan: {
    avg: 35000,
    rate: 0.0599,
    description: 'The average student loan debt is $35,000 with federal interest rates averaging 5.99% on graduate loans.'
  },
  autoLoan: {
    avg: 25000,
    rate: 0.0799,
    description: 'The average auto loan balance is $25,000 with interest rates averaging 7.99% for a 60-month new car loan.'
  }
};

// Calculate credit card minimum payment (interest + 1% of principal)
const calculateCreditCardMinPayment = (balance: number, rate: number): number => {
  const monthlyRate = rate / 12;
  const interest = balance * monthlyRate;
  const principal = balance * 0.01; // 1% of principal
  return Math.max(interest + principal, 25); // Minimum payment of $25
};

// Calculate mortgage payment (fixed payment for the life of the loan)
const calculateMortgagePayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const payments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
};

// Calculate student loan payment (standard repayment plan)
const calculateStudentLoanPayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const payments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
};

// Calculate auto loan payment (fixed payment for the life of the loan)
const calculateAutoLoanPayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const payments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
};

// Calculate payment scenarios for each debt type
const getPaymentScenarios = (debtType: string) => {
  const { avg, rate } = DEBT_STATISTICS[debtType as keyof typeof DEBT_STATISTICS];
  
  let minimumPayment = 0;
  let recommendedPayment = 0;
  let aggressivePayment = 0;
  
  let minimumYears = 0;
  let recommendedYears = 0;
  let aggressiveYears = 0;
  
  let minimumInterest = 0;
  let recommendedInterest = 0;
  let aggressiveInterest = 0;
  
  if (debtType === 'creditCard') {
    // Credit card
    minimumPayment = calculateCreditCardMinPayment(avg, rate);
    
    // Calculate total interest and years for minimum payment
    let balance = avg;
    let monthlyRate = rate / 12;
    let totalInterest = 0;
    let months = 0;
    
    while (balance > 0 && months < 1200) { // Cap at 100 years
      months++;
      let interest = balance * monthlyRate;
      totalInterest += interest;
      let principal = Math.min(minimumPayment - interest, balance);
      balance -= principal;
      
      // Recalculate minimum payment
      minimumPayment = calculateCreditCardMinPayment(balance, rate);
    }
    
    minimumYears = months / 12;
    minimumInterest = totalInterest;
    
    // Recommended: Pay off in 2 years
    recommendedYears = 2;
    recommendedPayment = calculateStudentLoanPayment(avg, rate, recommendedYears);
    recommendedInterest = (recommendedPayment * recommendedYears * 12) - avg;
    
    // Aggressive: Pay off in 1 year
    aggressiveYears = 1;
    aggressivePayment = calculateStudentLoanPayment(avg, rate, aggressiveYears);
    aggressiveInterest = (aggressivePayment * aggressiveYears * 12) - avg;
    
  } else if (debtType === 'mortgage') {
    // Mortgage
    // Standard 30-year mortgage
    minimumYears = 30;
    minimumPayment = calculateMortgagePayment(avg, rate, minimumYears);
    minimumInterest = (minimumPayment * minimumYears * 12) - avg;
    
    // Recommended: 20-year mortgage
    recommendedYears = 20;
    recommendedPayment = calculateMortgagePayment(avg, rate, recommendedYears);
    recommendedInterest = (recommendedPayment * recommendedYears * 12) - avg;
    
    // Aggressive: 15-year mortgage
    aggressiveYears = 15;
    aggressivePayment = calculateMortgagePayment(avg, rate, aggressiveYears);
    aggressiveInterest = (aggressivePayment * aggressiveYears * 12) - avg;
    
  } else if (debtType === 'studentLoan') {
    // Student loan
    // Standard 10-year repayment
    minimumYears = 10;
    minimumPayment = calculateStudentLoanPayment(avg, rate, minimumYears);
    minimumInterest = (minimumPayment * minimumYears * 12) - avg;
    
    // Recommended: 7-year repayment
    recommendedYears = 7;
    recommendedPayment = calculateStudentLoanPayment(avg, rate, recommendedYears);
    recommendedInterest = (recommendedPayment * recommendedYears * 12) - avg;
    
    // Aggressive: 5-year repayment
    aggressiveYears = 5;
    aggressivePayment = calculateStudentLoanPayment(avg, rate, aggressiveYears);
    aggressiveInterest = (aggressivePayment * aggressiveYears * 12) - avg;
    
  } else if (debtType === 'autoLoan') {
    // Auto loan
    // Standard 6-year auto loan
    minimumYears = 6;
    minimumPayment = calculateAutoLoanPayment(avg, rate, minimumYears);
    minimumInterest = (minimumPayment * minimumYears * 12) - avg;
    
    // Recommended: 5-year auto loan
    recommendedYears = 5;
    recommendedPayment = calculateAutoLoanPayment(avg, rate, recommendedYears);
    recommendedInterest = (recommendedPayment * recommendedYears * 12) - avg;
    
    // Aggressive: 3-year auto loan
    aggressiveYears = 3;
    aggressivePayment = calculateAutoLoanPayment(avg, rate, aggressiveYears);
    aggressiveInterest = (aggressivePayment * aggressiveYears * 12) - avg;
  }
  
  return {
    minimum: {
      monthlyPayment: minimumPayment,
      yearsToPayoff: minimumYears,
      totalPaid: minimumInterest + avg,
      totalInterest: minimumInterest,
      interestToDebtRatio: minimumInterest / avg
    },
    recommended: {
      monthlyPayment: recommendedPayment,
      yearsToPayoff: recommendedYears,
      totalPaid: recommendedInterest + avg,
      totalInterest: recommendedInterest,
      interestToDebtRatio: recommendedInterest / avg
    },
    aggressive: {
      monthlyPayment: aggressivePayment,
      yearsToPayoff: aggressiveYears,
      totalPaid: aggressiveInterest + avg,
      totalInterest: aggressiveInterest,
      interestToDebtRatio: aggressiveInterest / avg
    }
  };
};

// Define types for payment amortization tracking
interface PaymentPlan {
  month: number;
  balance: number;
  payment: number;
  interest: number;
  principal: number;
}

// Calculate the full amortization schedule for a loan
const calculateAmortization = (
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  months: number
): PaymentPlan[] => {
  const schedule: PaymentPlan[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12;
  
  for (let month = 1; month <= months && balance > 0; month++) {
    // Calculate interest for this month
    const interestPayment = balance * monthlyRate;
    
    // Calculate principal for this month (payment minus interest)
    const principalPayment = Math.min(
      monthlyPayment - interestPayment, // Normal case
      balance // Last payment might be smaller
    );
    
    // Update the remaining balance
    balance -= principalPayment;
    
    // Add this month to the schedule
    schedule.push({
      month,
      balance,
      payment: interestPayment + principalPayment,
      interest: interestPayment,
      principal: principalPayment,
    });
    
    // Break if balance is effectively zero (floating point precision)
    if (balance < 0.01) {
      balance = 0;
    }
  }
  
  return schedule;
};

// Format currency values
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const EnhancedDebtVisualization: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('recommended');
  const [selectedDebtType, setSelectedDebtType] = useState('creditCard');
  const [displayedScenarios, setDisplayedScenarios] = useState<string[]>(['minimum', 'recommended', 'aggressive']);
  const [selectedDebtInfo, setSelectedDebtInfo] = useState(DEBT_STATISTICS['creditCard']);
  
  // Calculate payment scenarios based on selected debt type
  const paymentScenarios = useMemo(() => getPaymentScenarios(selectedDebtType), [selectedDebtType]);
  
  const currentPlan = paymentScenarios[selectedPlan as keyof typeof paymentScenarios];
  
  // Function to toggle scenarios in the chart
  const toggleScenario = (scenario: string) => {
    setDisplayedScenarios(prev => {
      if (prev.includes(scenario)) {
        return prev.filter(s => s !== scenario);
      } else {
        return [...prev, scenario];
      }
    });
  };
  
  // Get scenario label
  const getScenarioLabel = (scenario: string): string => {
    switch (scenario) {
      case 'minimum':
        return 'Minimum Payment';
      case 'recommended':
        return 'Smart Strategy';
      case 'aggressive':
        return 'Aggressive Strategy';
      default:
        return scenario;
    }
  };
  
  // Generate the amortization schedule for the current plan
  const amortizationSchedule = useMemo(() => {
    const { avg, rate } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
    return calculateAmortization(avg, rate, currentPlan.monthlyPayment, currentPlan.yearsToPayoff * 12);
  }, [selectedPlan, selectedDebtType, currentPlan]);
  
  // Generate chart data for all three payment strategies
  const chartData = useMemo(() => {
    const { avg, rate } = DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS];
    
    // Just for the selected debt type, not longest overall
    const maxYears = paymentScenarios ? Math.max(
      ...Object.values(paymentScenarios).map(plan => plan.yearsToPayoff)
    ) : 10;
    
    // Create data points for a smooth curve
    const numPoints = Math.min(Math.max(12, maxYears * 4), 40);
    const timeStep = maxYears / numPoints;
    
    const series: ApexAxisChartSeries = [];
    const colors = {
      minimum: '#FF5252',
      recommended: '#4CAF50',
      aggressive: '#2196F3'
    };
    
    // Create a series for each scenario (minimum, recommended, aggressive)
    displayedScenarios.forEach(key => {
      if (paymentScenarios[key as keyof typeof paymentScenarios]) {
        const plan = paymentScenarios[key as keyof typeof paymentScenarios];
        
        // Calculate the balance over time
        const balanceData = calculateAmortization(
          avg, 
          rate, 
          plan.monthlyPayment, 
          Math.ceil(plan.yearsToPayoff * 12)
        );
        
        // Map balance data to chart points
        const dataPoints = balanceData
          .filter((_, index) => index % Math.max(1, Math.floor(balanceData.length / numPoints)) === 0)
          .map(point => ({
            x: point.month / 12, // Convert to years
            y: point.balance,
          }));
          
        // Add the starting point
        dataPoints.unshift({ x: 0, y: avg });
        
        // Add series
        series.push({
          name: getScenarioLabel(key),
          data: dataPoints,
          color: colors[key as keyof typeof colors]
        });
      }
    });
    
    return series;
  }, [selectedDebtType, paymentScenarios, displayedScenarios]);
  
  // ApexCharts options
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.7,
        opacityTo: 0.0,
        stops: [0, 100],
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.1
      },
      xaxis: {
        lines: {
          show: false,
        }
      },
      yaxis: {
        lines: {
          show: true,
        }
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20
      }
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        formatter: (val) => `${val.toFixed(1)} years`
      },
      y: {
        formatter: (val) => formatCurrency(val)
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      marker: {
        show: true,
      },
    },
    xaxis: {
      title: {
        text: 'Years',
        style: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        }
      },
      labels: {
        formatter: (val) => `${val.toFixed(0)}`,
        style: {
          colors: 'rgba(255, 255, 255, 0.6)',
        }
      },
      tooltip: {
        enabled: false,
      }
    },
    yaxis: {
      title: {
        text: 'Remaining Balance',
        style: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        }
      },
      labels: {
        formatter: (val) => formatCurrency(val),
        style: {
          colors: 'rgba(255, 255, 255, 0.6)',
        }
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      offsetY: -8,
      itemMargin: {
        horizontal: 12,
        vertical: 0
      },
      labels: {
        colors: 'rgba(255, 255, 255, 0.8)',
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: -4,
      },
    },
    markers: {
      size: 0,
      strokeColors: ['#FF5252', '#4CAF50', '#2196F3'],
      hover: {
        size: 6,
      }
    },
  };
  
  // Update selected debt info when debt type changes
  useEffect(() => {
    setSelectedDebtInfo(DEBT_STATISTICS[selectedDebtType as keyof typeof DEBT_STATISTICS]);
  }, [selectedDebtType]);
  
  return (
    <section className="py-16 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Debt Repayment Methods
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Based on real Federal Reserve data, explore how different payment strategies affect your path to financial freedom.
          </p>
        </motion.div>
        
        {/* Debt Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {DEBT_TYPES.map((debt) => {
            const Icon = debt.icon;
            const isActive = selectedDebtType === debt.id;
            
            return (
              <motion.button
                key={debt.id}
                onClick={() => setSelectedDebtType(debt.id)}
                className={`relative ${
                  isActive
                    ? 'bg-[#88B04B]/20 border-[#88B04B] text-foreground'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                } border rounded-lg p-4 text-center transition-all duration-300`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-3 ${
                    isActive ? 'bg-[#88B04B]/20' : 'bg-muted'
                  } mb-3`}>
                    <Icon className={`w-6 h-6 ${
                      isActive ? 'text-[#88B04B]' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="font-medium">{debt.name}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeDebtIndicator"
                    className="absolute inset-0 border-2 border-[#88B04B] rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Chart and Strategy Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-card backdrop-blur-sm border border-border rounded-xl p-6 h-full">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Balance Over Time</h3>
            
            {/* ApexCharts Component */}
            <div className="h-[400px] w-full">
              {typeof window !== 'undefined' && (
                <ReactApexChart
                  options={chartOptions}
                  series={chartData}
                  type="area"
                  height={400}
                />
              )}
            </div>
            
            {/* Chart Legend / Controls */}
            <div className="flex flex-wrap justify-center mt-6 gap-4">
              <button
                onClick={() => toggleScenario('minimum')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  displayedScenarios.includes('minimum')
                    ? 'bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/30'
                    : 'bg-muted text-muted-foreground border border-border'
                } transition-all`}
              >
                <span className="w-3 h-3 rounded-full bg-[#FF5252]"></span>
                Minimum Payment
              </button>
              
              <button
                onClick={() => toggleScenario('recommended')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  displayedScenarios.includes('recommended')
                    ? 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30'
                    : 'bg-muted text-muted-foreground border border-border'
                } transition-all`}
              >
                <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                Smart Strategy
              </button>
              
              <button
                onClick={() => toggleScenario('aggressive')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  displayedScenarios.includes('aggressive')
                    ? 'bg-[#2196F3]/20 text-[#2196F3] border border-[#2196F3]/30'
                    : 'bg-muted text-muted-foreground border border-border'
                } transition-all`}
              >
                <span className="w-3 h-3 rounded-full bg-[#2196F3]"></span>
                Aggressive Strategy
              </button>
            </div>
          </div>
          
          <div className="bg-card backdrop-blur-sm border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Payment Comparison</h3>
            
            {/* Debt Info Banner */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-[#88B04B] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">
                    {formatCurrency(selectedDebtInfo.avg)} Balance
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(selectedDebtInfo.rate * 100)}% APR
                  </div>
                </div>
              </div>
            </div>
            
            {/* Strategy Cards */}
            <div className="space-y-4">
              {/* Minimum Payment Strategy */}
              <div 
                className={`bg-card border rounded-lg p-4 transition-all ${
                  selectedPlan === 'minimum' 
                    ? 'border-[#FF5252] bg-[#FF5252]/10' 
                    : 'border-border hover:border-[#FF5252]/50 hover:bg-[#FF5252]/5'
                }`}
                onClick={() => setSelectedPlan('minimum')}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5252]"></span>
                    <h4 className="font-medium text-foreground">Minimum Payment</h4>
                  </div>
                  <div className="text-[#FF5252] text-sm font-medium">
                    {formatCurrency(paymentScenarios.minimum.monthlyPayment)}/mo
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time to pay off:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {paymentScenarios.minimum.yearsToPayoff.toFixed(1)} years
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Percent className="w-4 h-4" />
                    <span>Total interest:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {formatCurrency(paymentScenarios.minimum.totalInterest)}
                  </div>
                </div>
              </div>
              
              {/* Recommended Payment Strategy */}
              <div 
                className={`bg-card border rounded-lg p-4 transition-all ${
                  selectedPlan === 'recommended' 
                    ? 'border-[#4CAF50] bg-[#4CAF50]/10' 
                    : 'border-border hover:border-[#4CAF50]/50 hover:bg-[#4CAF50]/5'
                }`}
                onClick={() => setSelectedPlan('recommended')}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                    <h4 className="font-medium text-foreground">Smart Strategy</h4>
                  </div>
                  <div className="text-[#4CAF50] text-sm font-medium">
                    {formatCurrency(paymentScenarios.recommended.monthlyPayment)}/mo
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time to pay off:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {paymentScenarios.recommended.yearsToPayoff.toFixed(1)} years
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Percent className="w-4 h-4" />
                    <span>Total interest:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {formatCurrency(paymentScenarios.recommended.totalInterest)}
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                    <span>Savings vs. minimum:</span>
                  </div>
                  <div className="text-[#4CAF50] font-medium text-right">
                    {formatCurrency(paymentScenarios.minimum.totalInterest - paymentScenarios.recommended.totalInterest)}
                  </div>
                </div>
              </div>
              
              {/* Aggressive Payment Strategy */}
              <div 
                className={`bg-card border rounded-lg p-4 transition-all ${
                  selectedPlan === 'aggressive' 
                    ? 'border-[#2196F3] bg-[#2196F3]/10' 
                    : 'border-border hover:border-[#2196F3]/50 hover:bg-[#2196F3]/5'
                }`}
                onClick={() => setSelectedPlan('aggressive')}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2196F3]"></span>
                    <h4 className="font-medium text-foreground">Aggressive Strategy</h4>
                  </div>
                  <div className="text-[#2196F3] text-sm font-medium">
                    {formatCurrency(paymentScenarios.aggressive.monthlyPayment)}/mo
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time to pay off:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {paymentScenarios.aggressive.yearsToPayoff.toFixed(1)} years
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Percent className="w-4 h-4" />
                    <span>Total interest:</span>
                  </div>
                  <div className="text-foreground font-medium text-right">
                    {formatCurrency(paymentScenarios.aggressive.totalInterest)}
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                    <span>Savings vs. minimum:</span>
                  </div>
                  <div className="text-[#2196F3] font-medium text-right">
                    {formatCurrency(paymentScenarios.minimum.totalInterest - paymentScenarios.aggressive.totalInterest)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Debt Info Section */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-4 text-foreground">About {DEBT_TYPES.find(d => d.id === selectedDebtType)?.name} Debt</h3>
          <p className="text-muted-foreground">{selectedDebtInfo.description}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedDebtVisualization; 