import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useDashboard, DashboardState } from './useDashboard';

interface DebtProjection {
  month: string;
  amount: number;
  withOptimization: number;
}

interface DebtAnalytics {
  projections: DebtProjection[];
  payoffDate: Date;
  optimizedPayoffDate: Date;
  monthsSaved: number;
  interestSaved: number;
  recommendedExtraPayment: number;
  bestDebtToTarget: {
    category: string;
    reason: string;
    impact: number;
  };
  savingsOpportunities: Array<{
    id: string;
    title: string;
    description: string;
    monthlySavings: number;
    annualSavings: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  creditScoreImpact: {
    current: number;
    projected: number;
    timeframe: string;
    actions: string[];
  };
}

export function useDashboardAnalytics() {
  const { user } = useAuth();
  const { dashboardState } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DebtAnalytics | null>(null);

  // Calculate analytics based on dashboard state
  useEffect(() => {
    if (!dashboardState || !user) return;

    const calculateAnalytics = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        
        // Calculate payoff dates
        const today = new Date();
        const payoffDate = new Date(today);
        payoffDate.setMonth(payoffDate.getMonth() + 36); // 3 years from now
        
        const optimizedPayoffDate = new Date(today);
        optimizedPayoffDate.setMonth(optimizedPayoffDate.getMonth() + 24); // 2 years from now with optimization
        
        const monthsSaved = 12; // 1 year saved
        
        // Calculate interest saved
        const totalDebt = dashboardState.totalDebt || 0;
        const avgInterestRate = totalDebt > 0 && dashboardState.debtBreakdown && dashboardState.debtBreakdown.length > 0
          ? dashboardState.debtBreakdown.reduce(
              (sum, debt) => sum + debt.interestRate * debt.amount, 
              0
            ) / totalDebt
          : 0;
        
        const interestSaved = totalDebt * avgInterestRate * (monthsSaved / 12);
        
        // Generate debt projections
        const projections: DebtProjection[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = today.getMonth();
        
        let currentDebt = totalDebt;
        let optimizedDebt = totalDebt;
        const monthlyPayment = 1500; // Assumed monthly payment
        const optimizedMonthlyPayment = 2000; // Assumed optimized monthly payment
        
        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth + i) % 12;
          
          // Simple linear projection (in reality would be more complex with interest)
          currentDebt = Math.max(0, currentDebt - monthlyPayment);
          optimizedDebt = Math.max(0, optimizedDebt - optimizedMonthlyPayment);
          
          projections.push({
            month: months[monthIndex],
            amount: currentDebt,
            withOptimization: optimizedDebt
          });
        }
        
        // Determine best debt to target
        const highestInterestDebt = dashboardState.debtBreakdown && dashboardState.debtBreakdown.length > 0 
          ? [...dashboardState.debtBreakdown].sort(
              (a, b) => b.interestRate - a.interestRate
            )[0]
          : null;
        
        const bestDebtToTarget = highestInterestDebt 
          ? {
              category: highestInterestDebt.category,
              reason: 'Highest interest rate',
              impact: highestInterestDebt.amount * highestInterestDebt.interestRate
            }
          : {
              category: 'None',
              reason: 'No debt information available',
              impact: 0
            };
        
        // Generate savings opportunities
        const savingsOpportunities = [
          {
            id: '1',
            title: 'Balance Transfer',
            description: 'Transfer high-interest credit card debt to a 0% APR card for 18 months',
            monthlySavings: 125,
            annualSavings: 1500,
            difficulty: 'medium' as const
          },
          {
            id: '2',
            title: 'Refinance Student Loans',
            description: 'Current rates are 2% lower than your existing student loan',
            monthlySavings: 85,
            annualSavings: 1020,
            difficulty: 'easy' as const
          },
          {
            id: '3',
            title: 'Debt Consolidation',
            description: 'Consolidate multiple debts into a single lower-interest loan',
            monthlySavings: 200,
            annualSavings: 2400,
            difficulty: 'hard' as const
          }
        ];
        
        // Credit score impact
        const creditScoreImpact = {
          current: 680,
          projected: 720,
          timeframe: '6 months',
          actions: [
            'Keep making on-time payments',
            'Reduce credit utilization below 30%',
            'Avoid opening new credit accounts'
          ]
        };
        
        // Recommended extra payment
        const recommendedExtraPayment = Math.round(
          (dashboardState.totalBudget - dashboardState.totalSpent) * 0.5
        );
        
        setAnalytics({
          projections,
          payoffDate,
          optimizedPayoffDate,
          monthsSaved,
          interestSaved,
          recommendedExtraPayment,
          bestDebtToTarget,
          savingsOpportunities,
          creditScoreImpact
        });
      } catch (error) {
        console.error('Error calculating analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateAnalytics();
  }, [dashboardState, user]);
  
  // Derived metrics
  const metrics = useMemo(() => {
    if (!analytics || !dashboardState) return null;
    
    return {
      // Time to debt free
      timeToDebtFree: {
        standard: Math.ceil(dashboardState.totalDebt / 1500), // months, assuming $1500/month payment
        optimized: Math.ceil(dashboardState.totalDebt / 2000), // months, assuming $2000/month payment
      },
      
      // Potential interest savings
      potentialSavings: analytics.interestSaved,
      
      // Debt reduction rate
      debtReductionRate: {
        current: Math.abs(dashboardState.monthlyChange) / dashboardState.totalDebt * 100,
        target: 5, // 5% monthly reduction target
      },
      
      // Debt freedom score (0-100)
      debtFreedomScore: Math.min(100, Math.round(
        (dashboardState.aiOptimizationScore * 0.4) +
        (Math.min(50, 100 - dashboardState.debtToIncomeRatio) * 0.4) +
        (Math.min(100, Math.abs(dashboardState.monthlyChange) / 100) * 0.2)
      )),
    };
  }, [analytics, dashboardState]);

  return {
    isLoading,
    analytics,
    metrics
  };
} 