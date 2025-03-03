import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BankConnectionService } from '@/services/bankConnection';
import type { Account, Transaction, DashboardData, BankAccount, DashboardState } from '@/types';
import { Debt, PayoffStrategy } from '@/lib/dashboardConstants';
import { createMockDashboardData } from '@/lib/mockDashboardData';

// Create stable service instance
const bankService = BankConnectionService.getInstance();

// Create a mock dashboardState for backward compatibility
const createLegacyDashboardState = (dashboard: DashboardData): DashboardState => {
  const { accounts, transactions, isConnected } = dashboard;
  
  // Calculate total balances from accounts
  const totalDebt = accounts
    .filter(acc => acc.type === 'loan' || acc.type === 'mortgage' || acc.type === 'credit')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
  // Estimated monthly payment (20% of debt as a placeholder)
  const monthlyPayment = totalDebt * 0.05;
  
  // Map accounts to debt breakdown
  const debtBreakdown = accounts
    .filter(acc => acc.type === 'loan' || acc.type === 'mortgage' || acc.type === 'credit')
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      amount: Math.abs(acc.balance),
      interestRate: acc.type === 'credit' ? 18.9 : acc.type === 'mortgage' ? 4.5 : 6.8, // Placeholder interest rates
      minimumPayment: Math.abs(acc.balance) * 0.02, // Placeholder minimum payment
      type: acc.type === 'mortgage' 
        ? 'mortgage' 
        : acc.type === 'credit' 
          ? 'credit_card' 
          : 'personal_loan',
      lender: acc.institution.name,
      paymentFrequency: 'monthly'
    }));

  // Mock data for the remaining fields
  return {
    totalDebt,
    monthlyPayment,
    interestPaid: totalDebt * 0.05, // Placeholder
    debtFreeDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toDateString(), // 3 years from now
    monthlyChange: -2.5, // Placeholder for 2.5% reduction
    debtToIncomeRatio: 0.35, // Placeholder
    aiOptimizationScore: 78, // Placeholder
    debtBreakdown,
    savingsOpportunities: 1250, // Placeholder
    paymentHistory: [], // Empty placeholder
    projectedPayoff: [
      { date: new Date().toISOString(), amount: totalDebt },
      { date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), amount: totalDebt * 0.7 } // Placeholder for 30% reduction in 1 year
    ],
    insights: [], // Empty placeholder
    isAIEnabled: true,
    budgetCategories: [], // Empty placeholder
    monthlySpending: [], // Empty placeholder
    monthlyIncome: totalDebt * 0.25, // Placeholder
    creditScore: 720, // Placeholder
    totalBudget: 3000, // Placeholder
    totalSpent: 2400, // Placeholder
    isConnectingBank: false,
    bankConnectionError: null,
    connectedAccounts: accounts,
    isConnected
  };
};

export interface BankConnection {
  id: string;
  name: string;
  logoUrl?: string;
  lastSynced?: Date;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  accountCount: number;
}

export interface NextPayment {
  dueDate: Date;
  amount: number;
  payeeName: string;
  category: string;
}

export interface DashboardState {
  totalDebt: number;
  totalMonthlyPayment: number;
  monthlyChange: number;
  debts: Debt[];
  nextPayment?: NextPayment;
  bankConnections: BankConnection[];
  payoffStrategies: PayoffStrategy[];
}

export function useDashboard() {
  const { user } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

      // Simulate API fetch delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get mock data
      const mockData = createMockDashboardData();
      setDashboardState(mockData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Load dashboard data on mount
  useEffect(() => {
    if (user && isLoading) {
      refreshDashboard();
    }
  }, [user, refreshDashboard, isLoading]);

  // Handle adding a new debt
  const handleAddNewDebt = useCallback((newDebt: Debt) => {
    setDashboardState(prevState => {
      if (!prevState) return prevState;
      
      const updatedDebts = [...prevState.debts, newDebt];
      const updatedTotalDebt = prevState.totalDebt + newDebt.amount;
      const updatedTotalMonthlyPayment = prevState.totalMonthlyPayment + newDebt.minimumPayment;
      
      return {
        ...prevState,
        debts: updatedDebts,
        totalDebt: updatedTotalDebt,
        totalMonthlyPayment: updatedTotalMonthlyPayment
      };
    });
  }, []);

  // Handle viewing debt details
  const handleViewDebtDetails = useCallback((debtId: string) => {
    console.log(`Viewing details for debt with ID: ${debtId}`);
    // This would typically navigate to a detail page or open a modal
  }, []);

  // Handle scheduling a payment
  const handleSchedulePayment = useCallback(() => {
    console.log('Scheduling a new payment');
    // This would typically open a payment form
  }, []);

  // Handle viewing payment details
  const handleViewPaymentDetails = useCallback(() => {
    console.log('Viewing payment details');
    // This would typically navigate to a payment history page
  }, []);

  // Handle adding a bank connection
  const handleAddBankConnection = useCallback(() => {
    console.log('Adding a new bank connection');
    // This would typically open the bank connection flow
  }, []);

  // Handle viewing bank connection details
  const handleViewBankConnection = useCallback((connectionId: string) => {
    console.log(`Viewing details for bank connection with ID: ${connectionId}`);
    // This would typically navigate to a connection details page
  }, []);

  return {
    dashboardState,
    isLoading,
    isRefreshing,
    error,
    refreshDashboard,
    handleAddNewDebt,
    handleViewDebtDetails,
    handleSchedulePayment,
    handleViewPaymentDetails,
    handleAddBankConnection,
    handleViewBankConnection
  };
} 