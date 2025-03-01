import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Debt } from '@/lib/dashboardConstants';

// Define types for budget data
interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

export interface DashboardState {
  totalDebt: number;
  monthlyChange: number;
  debtToIncomeRatio: number;
  aiOptimizationScore: number;
  debtBreakdown: Debt[];
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'opportunity' | 'warning' | 'achievement';
    potentialSavings?: number;
    confidence: number;
  }>;
  isAIEnabled: boolean;
  // Budget-related properties
  budgetCategories: BudgetCategory[];
  monthlySpending: MonthlySpending[];
  totalBudget: number;
  totalSpent: number;
}

export function useDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    totalDebt: 0,
    monthlyChange: 0,
    debtToIncomeRatio: 0,
    aiOptimizationScore: 0,
    debtBreakdown: [],
    insights: [],
    isAIEnabled: true,
    // Initialize budget-related properties
    budgetCategories: [],
    monthlySpending: [],
    totalBudget: 0,
    totalSpent: 0
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // Simulating API call with mock data
      const mockData: DashboardState = {
        totalDebt: 45000,
        monthlyChange: -1200,
        debtToIncomeRatio: 45,
        aiOptimizationScore: 85,
        debtBreakdown: [
          {
            category: 'Credit Card',
            amount: 15000,
            interestRate: 0.1499,
            minimumPayment: 450
          },
          {
            category: 'Student Loan',
            amount: 30000,
            interestRate: 0.0599,
            minimumPayment: 350
          }
        ],
        insights: [
          {
            id: '1',
            title: 'High Interest Credit Card',
            description: 'Consider transferring your credit card balance to a lower interest card to save on interest payments.',
            type: 'opportunity',
            potentialSavings: 1200,
            confidence: 0.9
          },
          {
            id: '2',
            title: 'Payment Pattern',
            description: 'Your consistent payment history is improving your credit score.',
            type: 'achievement',
            confidence: 0.95
          }
        ],
        isAIEnabled: true,
        // Mock budget data
        budgetCategories: [
          {
            name: 'Housing',
            allocated: 1500,
            spent: 1450,
            color: '#88B04B'
          },
          {
            name: 'Transportation',
            allocated: 400,
            spent: 385,
            color: '#6A8F3D'
          },
          {
            name: 'Food',
            allocated: 600,
            spent: 720,
            color: '#4A6B2F'
          },
          {
            name: 'Utilities',
            allocated: 300,
            spent: 275,
            color: '#2D4D1E'
          },
          {
            name: 'Entertainment',
            allocated: 200,
            spent: 310,
            color: '#1E3311'
          }
        ],
        monthlySpending: [
          { month: 'Jan', amount: 2800 },
          { month: 'Feb', amount: 3100 },
          { month: 'Mar', amount: 2950 },
          { month: 'Apr', amount: 3200 },
          { month: 'May', amount: 2900 },
          { month: 'Jun', amount: 3140 }
        ],
        totalBudget: 3000,
        totalSpent: 3140
      };

      setDashboardState(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAIToggle = () => {
    setDashboardState(prev => ({
      ...prev,
      isAIEnabled: !prev.isAIEnabled
    }));
  };

  const handleAddDebt = (debt: Debt) => {
    // TODO: Implement add debt functionality
    console.log('Adding debt:', debt);
  };

  const handleViewDebtDetails = (debtId: string) => {
    // TODO: Implement view debt details functionality
    console.log('Viewing debt details:', debtId);
  };

  const handleApplyRecommendation = (recommendationId: string) => {
    // TODO: Implement apply recommendation functionality
    console.log('Applying recommendation:', recommendationId);
  };

  const handleSchedulePayment = (amount: number, date: string) => {
    // TODO: Implement schedule payment functionality
    console.log('Scheduling payment:', { amount, date });
  };

  // New budget-related functions
  const handleCreateBudget = () => {
    // TODO: Implement create budget functionality
    console.log('Creating new budget');
  };

  const handleAdjustBudget = (category: string) => {
    // TODO: Implement adjust budget functionality
    console.log('Adjusting budget for category:', category);
  };

  return {
    isLoading,
    error,
    dashboardState,
    handleAIToggle,
    handleAddDebt,
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment,
    handleCreateBudget,
    handleAdjustBudget
  };
} 