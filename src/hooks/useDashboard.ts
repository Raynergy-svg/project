import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Debt } from '@/lib/dashboardConstants';

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
    isAIEnabled: true
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // Simulating API call with mock data
      const mockData: DashboardState = {
        totalDebt: 45000,
        monthlyChange: -1200,
        debtToIncomeRatio: 0.45,
        aiOptimizationScore: 85,
        debtBreakdown: [
          {
            category: 'CREDIT_CARD',
            amount: 15000,
            interestRate: 0.1499,
            minimumPayment: 450
          },
          {
            category: 'STUDENT_LOAN',
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
        isAIEnabled: true
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

  return {
    isLoading,
    error,
    dashboardState,
    handleAIToggle,
    handleAddDebt,
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment
  };
} 