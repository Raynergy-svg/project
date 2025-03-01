import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useBankConnection, BankAccount, Transaction } from '@/services/bankConnection';
import { useFinancialAnalysis, FinancialProfile, DebtInfo } from '@/services/financialAnalysis';

// Define types for budget data
interface BudgetCategory {
  name: string;
  amount: number;
  limit: number;
  allocated: number;
  spent: number;
  color: string;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

export interface DashboardState extends FinancialProfile {
  // Additional properties specific to the dashboard
  isConnectingBank: boolean;
  bankConnectionError: string | null;
  connectedAccounts: BankAccount[];
}

export function useDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    totalDebt: 0,
    monthlyPayment: 0,
    interestPaid: 0,
    debtFreeDate: 'N/A',
    monthlyChange: 0,
    debtToIncomeRatio: 0,
    aiOptimizationScore: 0,
    debtBreakdown: [],
    savingsOpportunities: 0,
    paymentHistory: [],
    projectedPayoff: [],
    insights: [],
    isAIEnabled: true,
    budgetCategories: [],
    monthlySpending: [],
    monthlyIncome: 0,
    creditScore: 0,
    totalBudget: 0,
    totalSpent: 0,
    isConnectingBank: false,
    bankConnectionError: null,
    connectedAccounts: []
  });

  // Initialize bank connection and financial analysis hooks
  const { 
    isConnecting, 
    accounts, 
    transactions, 
    error: bankError, 
    connectBank, 
    fetchAccounts, 
    fetchTransactions 
  } = useBankConnection(user?.id || '');
  
  const { generateProfile } = useFinancialAnalysis();

  // Fetch dashboard data using bank connection and financial analysis
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // If we don't have any accounts yet, try to fetch them
      let currentAccounts = accounts;
      let currentTransactions = transactions;
      
      if (currentAccounts.length === 0) {
        currentAccounts = await fetchAccounts();
      }
      
      if (currentTransactions.length === 0 && currentAccounts.length > 0) {
        // Get transactions for the last 90 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        currentTransactions = await fetchTransactions({
          startDate,
          endDate,
          accountIds: currentAccounts.map(acc => acc.id)
        });
      }
      
      // Generate financial profile from bank data
      const profile = generateProfile(currentAccounts, currentTransactions);
      
      // Update dashboard state with profile data and bank connection info
      setDashboardState({
        ...profile,
        isConnectingBank: isConnecting,
        bankConnectionError: bankError,
        connectedAccounts: currentAccounts
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when user changes or bank connection updates
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, accounts.length, transactions.length]);

  // Update dashboard state when bank connection status changes
  useEffect(() => {
    setDashboardState(prev => ({
      ...prev,
      isConnectingBank: isConnecting,
      bankConnectionError: bankError
    }));
  }, [isConnecting, bankError]);

  // Handle AI feature toggle
  const handleAIToggle = () => {
    setDashboardState(prev => ({
      ...prev,
      isAIEnabled: !prev.isAIEnabled
    }));
  };

  // Handle connecting to bank
  const handleConnectBank = async () => {
    await connectBank();
    fetchDashboardData();
  };

  // Handle adding a new debt manually
  const handleAddDebt = async (debt: DebtInfo) => {
    try {
      // In a real implementation, this would call an API to save the debt
      // For now, we'll just update the local state
      setDashboardState(prev => {
        const updatedDebts = [...prev.debtBreakdown, debt];
        const totalDebt = updatedDebts.reduce((sum, d) => sum + d.amount, 0);
        const monthlyPayment = updatedDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
        
        return {
          ...prev,
          debtBreakdown: updatedDebts,
          totalDebt,
          monthlyPayment
        };
      });
    } catch (err) {
      setError('Failed to add debt');
      console.error('Error adding debt:', err);
    }
  };

  // Handle viewing debt details
  const handleViewDebtDetails = (debtId: string) => {
    // This would typically navigate to a debt details page or open a modal
    console.log('Viewing debt details:', debtId);
  };

  // Handle applying a recommendation
  const handleApplyRecommendation = (recommendationId: string) => {
    // In a real implementation, this would apply the recommendation and update the data
    console.log('Applying recommendation:', recommendationId);
    
    // For now, just mark the recommendation as applied by removing it from insights
    setDashboardState(prev => ({
      ...prev,
      insights: prev.insights.filter(insight => insight.id !== recommendationId)
    }));
  };

  // Handle scheduling a payment
  const handleSchedulePayment = (amount: number, date: string) => {
    // In a real implementation, this would call an API to schedule the payment
    console.log('Scheduling payment:', { amount, date });
    
    // For demonstration, update the dashboard state to reflect the scheduled payment
    setDashboardState(prev => {
      // Calculate new total debt after payment
      const newTotalDebt = Math.max(0, prev.totalDebt - amount);
      
      // Update projected payoff to reflect the payment
      const updatedProjections = prev.projectedPayoff.map(projection => ({
        ...projection,
        amount: Math.max(0, projection.amount - amount)
      }));
      
      return {
        ...prev,
        totalDebt: newTotalDebt,
        projectedPayoff: updatedProjections
      };
    });
  };

  // Handle creating a new budget
  const handleCreateBudget = () => {
    // In a real implementation, this would open a budget creation flow
    console.log('Creating new budget');
  };

  // Handle adjusting a budget category
  const handleAdjustBudget = (category: string, newAmount: number) => {
    // Update the budget category with the new allocated amount
    setDashboardState(prev => {
      const updatedCategories = prev.budgetCategories.map(cat => 
        cat.name === category 
          ? { ...cat, allocated: newAmount, limit: newAmount } 
          : cat
      );
      
      const totalBudget = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
      
      return {
        ...prev,
        budgetCategories: updatedCategories,
        totalBudget
      };
    });
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return {
    isLoading,
    error,
    dashboardState,
    handleAIToggle,
    handleConnectBank,
    handleAddDebt,
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment,
    handleCreateBudget,
    handleAdjustBudget,
    refreshDashboard
  };
} 