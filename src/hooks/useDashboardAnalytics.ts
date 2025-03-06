import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from './useDashboard';
import type { DashboardState } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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

// Types for tracking events
export type AnalyticsEvent = {
  type: 'view' | 'click' | 'interaction' | 'feature_usage';
  category: 'dashboard' | 'tool' | 'report' | 'setting';
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
};

export type FeatureUsage = {
  featureId: string;
  featureName: string;
  usageCount: number;
  lastUsed: Date;
};

export type DashboardAnalytics = {
  userId: string;
  sessionStartTime: Date;
  sessionDuration: number;
  events: AnalyticsEvent[];
  featuresUsed: Record<string, FeatureUsage>;
  pageViews: Record<string, number>;
};

export function useDashboardAnalytics() {
  const { user } = useAuth();
  const { dashboardState } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DebtAnalytics | null>(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics>({
    userId: user?.id || 'anonymous',
    sessionStartTime: new Date(),
    sessionDuration: 0,
    events: [],
    featuresUsed: {},
    pageViews: {},
  });

  // Memoize the dashboardState reference to prevent unnecessary recalculations
  const memoizedDashboardState = useMemo(() => dashboardState, [
    dashboardState?.totalDebt,
    dashboardState?.debtBreakdown,
    dashboardState?.totalBudget,
    dashboardState?.totalSpent,
    dashboardState?.monthlyChange,
    dashboardState?.aiOptimizationScore,
    dashboardState?.debtToIncomeRatio
  ]);

  // Calculate analytics based on dashboard state
  useEffect(() => {
    if (!memoizedDashboardState || !user) return;

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
        const totalDebt = memoizedDashboardState.totalDebt || 0;
        const avgInterestRate = totalDebt > 0 && memoizedDashboardState.debtBreakdown && memoizedDashboardState.debtBreakdown.length > 0
          ? memoizedDashboardState.debtBreakdown.reduce(
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
        const highestInterestDebt = memoizedDashboardState.debtBreakdown && memoizedDashboardState.debtBreakdown.length > 0 
          ? [...memoizedDashboardState.debtBreakdown].sort(
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
          (memoizedDashboardState.totalBudget - memoizedDashboardState.totalSpent) * 0.5
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
  }, [memoizedDashboardState, user?.id]);
  
  // Derived metrics
  const metrics = useMemo(() => {
    if (!analytics || !memoizedDashboardState) return null;
    
    return {
      // Time to debt free
      timeToDebtFree: {
        standard: Math.ceil(memoizedDashboardState.totalDebt / 1500), // months, assuming $1500/month payment
        optimized: Math.ceil(memoizedDashboardState.totalDebt / 2000), // months, assuming $2000/month payment
      },
      
      // Potential interest savings
      potentialSavings: analytics.interestSaved,
      
      // Debt reduction rate
      debtReductionRate: {
        current: Math.abs(memoizedDashboardState.monthlyChange) / memoizedDashboardState.totalDebt * 100,
        target: 5, // 5% monthly reduction target
      },
      
      // Debt freedom score (0-100)
      debtFreedomScore: Math.min(100, Math.round(
        (memoizedDashboardState.aiOptimizationScore * 0.4) +
        (Math.min(50, 100 - memoizedDashboardState.debtToIncomeRatio) * 0.4) +
        (Math.min(100, Math.abs(memoizedDashboardState.monthlyChange) / 100) * 0.2)
      )),
    };
  }, [analytics, memoizedDashboardState]);

  // Initialize analytics session
  useEffect(() => {
    if (user?.id) {
      setDashboardAnalytics(prev => ({
        ...prev,
        userId: user.id,
        sessionStartTime: new Date(),
      }));
    }

    // Start session timer
    const intervalId = setInterval(() => {
      setDashboardAnalytics(prev => ({
        ...prev,
        sessionDuration: Math.floor((new Date().getTime() - prev.sessionStartTime.getTime()) / 1000),
      }));
    }, 1000);

    // Track page view
    trackPageView('dashboard');

    return () => {
      clearInterval(intervalId);
      // Here you would typically send the session data to your analytics service
      saveAnalyticsData();
    };
  }, [user?.id]);

  // Save analytics data to storage or send to server
  const saveAnalyticsData = useCallback(() => {
    // In a real implementation, you would send this data to your analytics service
    // For now, we'll just log it
    console.log('Analytics data:', dashboardAnalytics);
    
    // You could use localStorage for a simple implementation
    try {
      const existingData = localStorage.getItem('dashboardAnalytics');
      let allData = existingData ? JSON.parse(existingData) : [];
      
      // Add current session data
      allData.push({
        ...dashboardAnalytics,
        sessionEndTime: new Date(),
      });
      
      // Store back in localStorage (in a real app, send to server)
      localStorage.setItem('dashboardAnalytics', JSON.stringify(allData));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }, [dashboardAnalytics]);

  // Track a specific event
  const trackEvent = useCallback((
    type: AnalyticsEvent['type'],
    category: AnalyticsEvent['category'],
    action: string,
    label?: string,
    value?: number
  ) => {
    const event: AnalyticsEvent = {
      type,
      category,
      action,
      label,
      value,
      timestamp: new Date(),
    };

    setDashboardAnalytics(prev => ({
      ...prev,
      events: [...prev.events, event],
    }));

    // For debugging
    console.log('Event tracked:', event);
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback((featureId: string, featureName: string) => {
    setDashboardAnalytics(prev => {
      const existingFeature = prev.featuresUsed[featureId];
      
      return {
        ...prev,
        featuresUsed: {
          ...prev.featuresUsed,
          [featureId]: {
            featureId,
            featureName,
            usageCount: existingFeature ? existingFeature.usageCount + 1 : 1,
            lastUsed: new Date(),
          },
        },
      };
    });

    // Also track as an event
    trackEvent('feature_usage', 'tool', `use_${featureId}`, featureName);
  }, [trackEvent]);

  // Track page views
  const trackPageView = useCallback((pageName: string) => {
    setDashboardAnalytics(prev => {
      const currentCount = prev.pageViews[pageName] || 0;
      
      return {
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [pageName]: currentCount + 1,
        },
      };
    });

    // Also track as an event
    trackEvent('view', 'dashboard', `view_${pageName}`);
  }, [trackEvent]);

  // Get most used features
  const getMostUsedFeatures = useCallback(() => {
    const features = Object.values(dashboardAnalytics.featuresUsed);
    return features.sort((a, b) => b.usageCount - a.usageCount);
  }, [dashboardAnalytics.featuresUsed]);

  // Get engagement score (simple calculation - can be made more sophisticated)
  const getEngagementScore = useCallback(() => {
    const featuresUsedCount = Object.keys(dashboardAnalytics.featuresUsed).length;
    const eventsCount = dashboardAnalytics.events.length;
    const sessionMinutes = dashboardAnalytics.sessionDuration / 60;
    
    // Simple scoring formula - adjust weights as needed
    return Math.min(100, (
      (featuresUsedCount * 10) + 
      (eventsCount * 2) + 
      (sessionMinutes * 5)
    ) / 10);
  }, [dashboardAnalytics.featuresUsed, dashboardAnalytics.events, dashboardAnalytics.sessionDuration]);

  return {
    isLoading,
    analytics,
    metrics,
    trackEvent,
    trackFeatureUsage,
    trackPageView,
    getMostUsedFeatures,
    getEngagementScore,
    dashboardAnalytics,
  };
} 