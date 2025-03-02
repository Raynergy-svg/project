import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { DebtBreakdown } from '@/components/dashboard/DebtBreakdown';
import { NextPayment } from '@/components/dashboard/NextPayment';
import { BankConnections } from '@/components/dashboard/BankConnections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';

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
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { 
    isLoading, 
    error, 
    dashboardState, 
    handleAddDebt, 
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment,
    handleAdjustBudget,
    handleToggleAI,
    handleViewPayoffPlan
  } = useDashboard();

  // For demo purposes, we'll assume onboarding is complete
  const isOnboardingComplete = true;

  // Try to fix database issues if they occur
  useEffect(() => {
    const checkAndFixDatabase = async () => {
      if (error && (error.includes('404') || error.includes('does not exist'))) {
        setIsFixingDatabase(true);
        try {
          // Attempt to create the tables that might be missing
          await createBankAccountsTable();
          // Wait a bit then reload the page
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          console.error('Failed to fix database issue:', err);
          setLocalError(err instanceof Error ? err.message : String(err));
        } finally {
          setIsFixingDatabase(false);
        }
      }
    };
    
    checkAndFixDatabase();
  }, [error]);

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

  if (isLoading || isFixingDatabase) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/70">
            {isFixingDatabase 
              ? 'Setting up your database. This may take a moment...' 
              : 'Loading your financial dashboard...'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || localError) {
    const errorMessage = localError || error;
    
    // Handle specific error cases with helpful messages
    let userFriendlyMessage = errorMessage;
    if (errorMessage?.includes('404') || errorMessage?.includes('does not exist')) {
      userFriendlyMessage = 'We encountered an issue with the database. Please try refreshing the page.';
    }
    
    return (
      <DashboardLayout>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-white/70 mb-4">
            {userFriendlyMessage}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Retry
            </button>
            {(errorMessage?.includes('404') || errorMessage?.includes('does not exist')) && (
              <button
                onClick={async () => {
                  setIsFixingDatabase(true);
                  try {
                    await createBankAccountsTable();
                    setTimeout(() => window.location.reload(), 1000);
                  } catch (err) {
                    console.error('Failed to fix database:', err);
                    setIsFixingDatabase(false);
                    setLocalError(err instanceof Error ? err.message : String(err));
                  }
                }}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Fix Database
              </button>
            )}
          </div>
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
          <OverviewCards 
            data={dashboardState} 
            onAIToggle={handleToggleAI}
            onViewPayoffPlan={handleViewPayoffPlan}
          />
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Debt Breakdown - Takes up 2/3 of the width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
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

          {/* Next Payment - Takes up 1/3 of the width */}
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
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add default export
export default Dashboard;