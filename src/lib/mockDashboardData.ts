import { Debt, PayoffStrategy, DebtTarget, CreditScoreImpact } from './dashboardConstants';
import { BankConnection, NextPayment, DashboardState } from '@/hooks/useDashboard';

// Create a mock dashboard data function to simulate API response
export function createMockDashboardData(): DashboardState {
  // Mock data for bestDebtToTarget
  const bestDebtToTarget: DebtTarget = {
    id: '1',
    name: 'Chase Sapphire Card',
    category: 'Credit Card',
    reason: 'Highest interest rate at 18.99%'
  };

  // Mock data for creditScoreImpact
  const creditScoreImpact: CreditScoreImpact = {
    current: 680,
    potential: 720,
    changeDescription: 'Paying down high-interest debt will improve your score'
  };

  return {
    totalDebt: 42500,
    totalMonthlyPayment: 1250,
    monthlyChange: -350,
    debts: [
      {
        id: '1',
        name: 'Chase Sapphire Card',
        category: 'Credit Card',
        amount: 5500,
        interestRate: 18.99,
        minimumPayment: 150,
      },
      {
        id: '2',
        name: 'Student Loan',
        category: 'Student Loan',
        amount: 22000,
        interestRate: 5.25,
        minimumPayment: 350,
      },
      {
        id: '3',
        name: 'Car Loan',
        category: 'Auto Loan',
        amount: 15000,
        interestRate: 3.75,
        minimumPayment: 450,
      },
    ],
    nextPayment: {
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      amount: 150,
      payeeName: 'Chase Bank',
      category: 'Credit Card',
    },
    bankConnections: [
      {
        id: '1',
        name: 'Chase Bank',
        logoUrl: 'https://logo.clearbit.com/chase.com',
        lastSynced: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'connected',
        accountCount: 2,
      },
      {
        id: '2',
        name: 'Bank of America',
        lastSynced: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'connected',
        accountCount: 1,
      }
    ],
    payoffStrategies: [
      {
        id: 'avalanche',
        name: 'Avalanche Method',
        description: 'Pay off high-interest debt first',
        projectedPayoffDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        monthlyPayment: 1250,
        totalInterestPaid: 4350,
        projectionData: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          balance: Math.max(0, 42500 - (1250 * i))
        })),
        recommendedExtraPayment: 100,
        bestDebtToTarget: bestDebtToTarget,
        creditScoreImpact: creditScoreImpact
      },
      {
        id: 'snowball',
        name: 'Snowball Method',
        description: 'Pay off smallest debts first',
        projectedPayoffDate: new Date(Date.now() + 380 * 24 * 60 * 60 * 1000), // 380 days from now
        monthlyPayment: 1250,
        totalInterestPaid: 4850,
        projectionData: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          balance: Math.max(0, 42500 - (1200 * i))
        })),
        recommendedExtraPayment: 120,
        bestDebtToTarget: bestDebtToTarget,
        creditScoreImpact: creditScoreImpact
      },
      {
        id: 'optimized',
        name: 'AI Optimized',
        description: 'Custom plan for your situation',
        projectedPayoffDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000), // 350 days from now
        monthlyPayment: 1250,
        totalInterestPaid: 4120,
        projectionData: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          balance: Math.max(0, 42500 - (1300 * i))
        })),
        recommendedExtraPayment: 150,
        bestDebtToTarget: bestDebtToTarget,
        creditScoreImpact: creditScoreImpact
      },
    ]
  };
} 