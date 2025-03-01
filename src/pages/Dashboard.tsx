import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { DebtBreakdown } from '@/components/dashboard/DebtBreakdown';
import { NextPayment } from '@/components/dashboard/NextPayment';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AIFinancialInsights } from '@/components/dashboard/AIFinancialInsights';
import { BudgetAnalyzer } from '@/components/dashboard/BudgetAnalyzer';
import { BankConnections } from '@/components/dashboard/BankConnections';
import { AIDebtAssistant } from '@/components/dashboard/AIDebtAssistant';
import { CreditScoreWidget } from '@/components/dashboard/CreditScoreWidget';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define DebtCategory type to match expected enum
type DebtCategory = 'Credit Card' | 'Student Loan' | 'Auto Loan' | 'Mortgage' | 'Personal Loan' | 'Medical Debt' | 'Other';

// Define Debt interface to match expected type
interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  category: DebtCategory;
}

// Define BudgetCategory interface to match expected type
interface BudgetCategory {
  name: string;
  amount: number;
  limit: number;
  allocated: number;
  spent: number;
  color: string;
}

// Define MonthlySpending interface to match expected type
interface MonthlySpending {
  month: string;
  amount: number;
}

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    isLoading, 
    error, 
    dashboardState, 
    handleAddDebt, 
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment,
    handleAdjustBudget
  } = useDashboard();

  // For demo purposes, we'll assume onboarding is complete
  const isOnboardingComplete = true;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in to access your dashboard</h1>
          <button
            onClick={() => navigate('/signin')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete) {
    return (
      <DashboardLayout>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Onboarding</h2>
          <p className="text-white/70">
            Please complete the onboarding process to access your dashboard.
          </p>
          <button
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Start Onboarding
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70">Loading your financial dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-white/70">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Check if we have connected accounts
  const hasConnectedAccounts = dashboardState.connectedAccounts.length > 0;

  // If no accounts are connected, show a simplified dashboard with bank connection prompt
  if (!hasConnectedAccounts) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#88B04B]/20 to-[#88B04B]/5 border border-[#88B04B]/20 backdrop-blur-sm shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Financial Dashboard</h2>
            <p className="text-white/70 mb-6">
              Connect your bank accounts to get personalized insights and start tracking your financial progress.
            </p>
            <BankConnections />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AIDebtAssistant />
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OverviewCards data={dashboardState} />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <DebtBreakdown 
                debts={dashboardState.debtBreakdown} 
                onAddDebt={() => handleAddDebt({
                  id: crypto.randomUUID(),
                  category: 'Credit Card',
                  amount: 0,
                  interestRate: 0,
                  minimumPayment: 0,
                  name: '',
                })} 
                onViewDetails={(id: string) => handleViewDebtDetails(id)} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BudgetAnalyzer 
                dashboardState={dashboardState}
                onAdjustBudget={(category: string) => handleAdjustBudget(category, 0)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AIFinancialInsights 
                insights={dashboardState.insights} 
                isLoading={isLoading}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <NextPayment 
                dueDate={dashboardState.debtBreakdown.length > 0 ? new Date().toISOString().split('T')[0] : ''}
                amount={dashboardState.monthlyPayment}
                isAutomated={false}
                onSchedule={handleSchedulePayment}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <QuickStats 
                debtToIncome={dashboardState.debtToIncomeRatio * 100}
                monthlyChange={dashboardState.monthlyChange}
                aiScore={dashboardState.aiOptimizationScore}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CreditScoreWidget />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AIDebtAssistant />
            </motion.div>
          </div>
        </div>

        {/* Bank Connections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <BankConnections />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// Add default export
export default Dashboard;