import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';
import type { DebtInfo as Debt, BudgetCategory, MonthlySpending } from '@/services/financialAnalysis';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Skeleton, SkeletonCardGrid } from '@/components/ui/Skeleton';
import { LazyLoad } from '@/components/ui/LazyLoad';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Lazy loaded components for better performance
const OverviewCards = lazy(() => import('@/components/dashboard/OverviewCards'));
const DebtBreakdown = lazy(() => import('@/components/dashboard/DebtBreakdown'));
const NextPayment = lazy(() => import('@/components/dashboard/NextPayment'));
const BankConnections = lazy(() => import('@/components/dashboard/BankConnections'));
const DebtProjection = lazy(() => import('@/components/dashboard/DebtProjection'));
const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(module => ({ default: module.LoadingSpinner })));

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Skeleton for top cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton variant="card" className="h-52" />
      <Skeleton variant="card" className="h-52" />
      <Skeleton variant="card" className="h-52" />
    </div>
    
    {/* Skeleton for main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton variant="card" className="h-96" />
      <Skeleton variant="card" className="h-96" />
    </div>
  </div>
);

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  
  const { 
    isLoading, 
    error, 
    dashboardState, 
    handleAddNewDebt,
    handleViewDebtDetails,
    handleSchedulePayment,
    handleViewPaymentDetails,
    handleAddBankConnection,
    handleViewBankConnection,
    refreshDashboard,
    bankError
  } = useDashboard();

  // For demo purposes, we'll assume onboarding is complete
  const isOnboardingComplete = true;

  // Prevent duplicate refreshes
  const handleRefreshDashboard = useCallback(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Initial data load only when user ID changes
  useEffect(() => {
    // Set up mounted flag
    isMountedRef.current = true;
    
    // Only fetch if we have a user ID
    if (user?.id) {
      handleRefreshDashboard();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [user?.id, handleRefreshDashboard]); // Adding handleRefreshDashboard with proper memoization is safe

  // Try to fix database issues if they occur
  useEffect(() => {
    if (!error) return; // Skip if no error
    
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
  }, [error]); // Only run when error changes

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
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (isRefreshing) {
    return (
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <RefreshButton isRefreshing={true} onClick={() => {}} />
        </div>
        <DashboardSkeleton />
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
  const hasConnectedAccounts = dashboardState?.bankConnections?.length > 0;

  // Handle the case when data is incomplete but not throwing errors
  const isDataIncomplete = !dashboardState || 
                          (!dashboardState.debts?.items?.length && 
                           !dashboardState.insights?.length && 
                           !dashboardState.spending?.monthly);

  // If no accounts are connected, show a simplified dashboard with bank connection prompt
  if (!hasConnectedAccounts || isDataIncomplete) {
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
              {isDataIncomplete 
                ? "We're having trouble loading complete financial data. Connect your accounts or try refreshing."
                : "Connect your bank accounts to get personalized insights and start tracking your financial progress."
              }
            </p>
            <Suspense fallback={<Skeleton height="8rem" />}>
              <BankConnections />
            </Suspense>
            {isDataIncomplete && (
              <button
                onClick={handleRefreshDashboard}
                className="mt-4 rounded-md bg-[#88B04B] px-4 py-2 text-white hover:bg-[#7a9d43]"
              >
                Refresh Data
              </button>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshDashboard}
            disabled={isRefreshing}
            className="flex items-center text-white border-white/20 hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {(isLoading || isRefreshing) && !dashboardState ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              onClick={handleRefreshDashboard}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <LazyLoad height="180px" skeletonVariant="card">
              <Suspense fallback={<Skeleton variant="card" className="h-40" />}>
                <OverviewCards 
                  totalDebt={dashboardState?.totalDebt || 0}
                  totalMonthlyPayment={dashboardState?.totalMonthlyPayment || 0}
                  monthlyChange={dashboardState?.monthlyChange || 0}
                />
              </Suspense>
            </LazyLoad>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Debt Breakdown */}
              <LazyLoad height="500px" skeletonVariant="card">
                <Suspense fallback={<Skeleton variant="card" className="h-[500px]" />}>
                  <DebtBreakdown 
                    debts={dashboardState?.debts || []}
                    onAddDebt={handleAddNewDebt}
                    onViewDetails={handleViewDebtDetails}
                  />
                </Suspense>
              </LazyLoad>
              
              {/* Next Payment */}
              <LazyLoad height="250px" skeletonVariant="card">
                <Suspense fallback={<Skeleton variant="card" className="h-[250px]" />}>
                  <NextPayment 
                    dueDate={dashboardState?.nextPayment?.dueDate ? new Date(dashboardState.nextPayment.dueDate) : undefined}
                    amount={dashboardState?.nextPayment?.amount}
                    payeeName={dashboardState?.nextPayment?.payeeName}
                    category={dashboardState?.nextPayment?.category}
                    onAddPayment={handleSchedulePayment}
                    onViewDetails={handleViewPaymentDetails}
                  />
                </Suspense>
              </LazyLoad>
              
              {/* Bank Connections */}
              <LazyLoad height="250px" skeletonVariant="card">
                <Suspense fallback={<Skeleton variant="card" className="h-[250px]" />}>
                  <BankConnections 
                    connections={dashboardState?.bankConnections || []}
                    onAddConnection={handleAddBankConnection}
                    onViewConnection={handleViewBankConnection}
                  />
                </Suspense>
              </LazyLoad>
              
              {/* Debt Projection */}
              <LazyLoad height="500px" skeletonVariant="card">
                <Suspense fallback={<Skeleton variant="card" className="h-[500px]" />}>
                  <DebtProjection 
                    debts={dashboardState?.debts || []}
                    strategies={dashboardState?.payoffStrategies || []}
                  />
                </Suspense>
              </LazyLoad>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add default export
export default Dashboard;