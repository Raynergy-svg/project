import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BankConnectionService } from '@/services/bankConnection';
import type { Account, Transaction, DashboardData, BankAccount, DashboardState } from '@/types';
import { Debt, PayoffStrategy } from '@/lib/dashboardConstants';
import { createMockDashboardData } from '@/lib/mockDashboardData';
import { supabase } from '@/utils/supabase/client';

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
  const [bankError, setBankError] = useState<string | null>(null);

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
      setBankError(null);

      // First, check if the user has any connected bank accounts
      let hasConnectedBanks = false;
      let bankAccounts: BankAccount[] = [];
      
      try {
        // Try to fetch bank accounts from Supabase
        const { data: accountsData, error: accountsError } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (!accountsError && accountsData && accountsData.length > 0) {
          hasConnectedBanks = true;
          bankAccounts = accountsData.map(acc => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            institution: {
              id: acc.institution_id || '',
              name: acc.institution || '',
            },
            availableBalance: acc.available_balance,
            currency: acc.currency || 'USD',
            lastUpdated: new Date(acc.last_updated || Date.now()),
          }));
        }
      } catch (bankErr) {
        console.warn('Error fetching bank accounts:', bankErr);
        // Don't fail the whole dashboard if bank fetch fails
        setBankError('Failed to load bank account data. You can still use the dashboard.');
      }
      
      // If no connected banks, return a minimal dashboard state
      if (!hasConnectedBanks) {
        const mockData = createMockDashboardData();
        // Clear any mock debt data when no banks are connected
        mockData.debts = [];
        mockData.bankConnections = [];
        setDashboardState(mockData);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // If we have connected banks, fetch actual data or use mock data
      // Simulate API fetch delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Get mock data enhanced with actual bank info if available
      const mockData = createMockDashboardData();
      
      // If we have real bank accounts, use that data to enhance our dashboard
      if (bankAccounts.length > 0) {
        // Transform bank accounts into bank connections
        const connections = transformBankAccountsToConnections(bankAccounts);
        mockData.bankConnections = connections;
        
        // Use bank account data to create more realistic debt data
        // This logic would depend on your specific data model
        const debtAccounts = bankAccounts.filter(acc => 
          acc.type === 'loan' || acc.type === 'mortgage' || acc.type === 'credit');
          
        if (debtAccounts.length > 0) {
          mockData.debts = debtAccounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            category: acc.type === 'mortgage' ? 'Mortgage' : 
                     acc.type === 'credit' ? 'Credit Card' : 'Personal Loan',
            amount: Math.abs(acc.balance),
            interestRate: acc.type === 'credit' ? 18.99 : 
                          acc.type === 'mortgage' ? 4.5 : 6.8,
            minimumPayment: Math.abs(acc.balance) * 0.02,
          }));
          
          // Update total debt and monthly payment based on actual accounts
          mockData.totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
          mockData.totalMonthlyPayment = mockData.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
        }
      }
      
      setDashboardState(mockData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Helper function to transform bank accounts to connections
  const transformBankAccountsToConnections = (accounts: BankAccount[]) => {
    // Group accounts by institution
    const accountsByInstitution = accounts.reduce((result, account) => {
      const institutionName = account.institution.name;
      if (!result[institutionName]) {
        result[institutionName] = [];
      }
      result[institutionName].push(account);
      return result;
    }, {} as Record<string, BankAccount[]>);
    
    // Create connections from grouped accounts
    return Object.entries(accountsByInstitution).map(([name, accounts], index) => ({
      id: `conn-${index}`,
      name: name,
      logoUrl: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`,
      lastSynced: accounts[0].lastUpdated,
      status: 'connected' as const,
      accountCount: accounts.length,
    }));
  };

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
    // In a real implementation, you would open a modal or redirect to a bank connection flow
    // For now, we'll just show this message
    alert('This would open the Plaid bank connection flow in a production app.');
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
    bankError,
    refreshDashboard,
    handleAddNewDebt,
    handleViewDebtDetails,
    handleSchedulePayment,
    handleViewPaymentDetails,
    handleAddBankConnection,
    handleViewBankConnection
  };
} 