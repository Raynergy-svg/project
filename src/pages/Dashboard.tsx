import { Button } from '@/components/ui/button';
import { DebtBreakdown } from '@/components/dashboard/DebtBreakdown';
import { NextPayment } from '@/components/dashboard/NextPayment';
import { DebtProjection } from '@/components/dashboard/DebtProjection';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { BankConnections } from '@/components/dashboard/BankConnections';
import { Suspense, useCallback, useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  ArrowDownToLine, 
  LineChart, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign,
  LayoutDashboard,
  Building,
  ArrowUpDown,
  BarChart,
  CreditCardIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useRef } from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from '@/components/dashboard/MetricCard';

// Animation variants for consistency with landing page
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

// Tab content animation variants
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Format currency function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const bankConnectionsRef = useRef<HTMLDivElement>(null);
  const { dashboardState, error, isLoading, refreshDashboard, isRefreshing, updateDebt } = useDashboard();
  const { connectAccount, getLinkToken, isInitializing } = useBankConnection();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [showRefreshError, setShowRefreshError] = useState(false);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  
  // Check if we have connected accounts
  const hasConnectedAccounts = dashboardState?.bankConnections?.length > 0;
  
  // Define if data is incomplete (no debts and no bank connections)
  const isDataIncomplete = !dashboardState || (!dashboardState.debts?.length && !dashboardState.bankConnections?.length);
  
  // Auto-show connect dialog if no connections
  useEffect(() => {
    if (!isLoading && dashboardState && dashboardState.bankConnections?.length === 0) {
      setShowConnectAlert(true);
    }
  }, [isLoading, dashboardState]);
  
  // Handle refreshing dashboard data
  const handleRefreshDashboard = useCallback(async () => {
    try {
      setRefreshError(null);
      await refreshDashboard();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setRefreshError(error instanceof Error ? error.message : 'Failed to refresh dashboard data');
      setShowRefreshError(true);
    }
  }, [refreshDashboard]);

  // Scroll to bank connections section
  const scrollToBankConnections = useCallback(() => {
    if (bankConnectionsRef.current) {
      bankConnectionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bankConnectionsRef]);
  
  // Handle viewing debt projections by switching to the projections tab
  const handleViewProjections = useCallback(() => {
    setActiveTab('projections');
  }, []);
  
  // Handle debt actions
  const handleAddDebt = (debt) => {
    console.log('Adding debt:', debt);
    setIsAddingDebt(true);
    // Here you would typically open a modal to add a debt
  };
  
  const handleViewDebtDetails = (debtId) => {
    console.log('Viewing debt details:', debtId);
    // Here you would typically navigate to debt details page or open a modal
  };
  
  // Handle connection actions
  const handleAddConnection = () => {
    console.log('Adding connection');
    // Here you would typically open Plaid Link or another connection flow
  };
  
  const handleRefreshConnections = () => {
    console.log('Refreshing connections');
    refreshDashboard();
  };
  
  const handleManageConnection = (connectionId) => {
    console.log('Managing connection:', connectionId);
    // Here you would typically navigate to connection details page or open a modal
  };
  
  // Handle payment actions
  const handleViewAllPayments = () => {
    console.log('Viewing all payments');
    // Here you would typically navigate to payments page
  };
  
  const handlePayNow = () => {
    console.log('Paying now');
    // Here you would typically open a payment flow
  };
  
  // Handle strategy actions
  const handleViewStrategyDetails = () => {
    console.log('Viewing strategy details');
    // Here you would typically navigate to strategy details page or open a modal
  };
  
  const handleCreateCustomStrategy = () => {
    console.log('Creating custom strategy');
    // Here you would typically open a custom strategy creation flow
  };
  
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert variant="destructive" className="mb-8 border border-destructive/20 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshDashboard}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
        </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-32 w-full rounded-xl" variant="card" />
          <Skeleton className="h-32 w-full rounded-xl" variant="card" />
          <Skeleton className="h-32 w-full rounded-xl" variant="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-64 w-full rounded-xl" variant="card" />
          <Skeleton className="h-64 w-full rounded-xl" variant="card" />
        </div>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Skeleton className="h-[400px] w-full rounded-xl" variant="card" />
        </div>
      </div>
    );
  }
  
  // Simplified dashboard when no accounts connected
  if (isDataIncomplete) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          custom={0}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">Welcome to Your Dashboard</h1>
          <p className="text-white/70 mb-8">Connect your bank accounts to get started with personalized insights.</p>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          custom={1}
          className="bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-xl mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#88B04B]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#88B04B]/5 rounded-full blur-[100px]" />
          </div>
          
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <LineChart className="w-12 h-12 text-[#88B04B] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-white">No Financial Data Available</h2>
            <p className="text-white/70 mb-6">
              To provide you with personalized insights and debt management strategies, we need to connect to your financial accounts.
            </p>
            
            <div className="grid gap-6 mb-8">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-[#88B04B]/20 mr-3">
                  <ArrowDownToLine className="w-5 h-5 text-[#88B04B]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white mb-1">Track all your debts in one place</h3>
                  <p className="text-white/70 text-sm">Connect your bank accounts to automatically import and organize all your outstanding debts.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-[#88B04B]/20 mr-3">
                  <LineChart className="w-5 h-5 text-[#88B04B]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white mb-1">Get personalized payoff strategies</h3>
                  <p className="text-white/70 text-sm">Our AI analyzes your financial data to create optimized debt payoff strategies tailored just for you.</p>
                </div>
              </div>
            </div>
            
            <Suspense fallback={
              <Button 
                disabled 
                className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white hover:opacity-90"
              >
                Loading...
              </Button>
            }>
              <BankConnections 
                connections={[]}
                onAddConnection={handleAddConnection}
                onRefreshConnections={handleRefreshConnections}
                onManageConnection={handleManageConnection}
              />
            </Suspense>
          </div>
          </motion.div>
        </div>
    );
  }
  
  // Calculate average interest rate if data available
  const averageInterestRate = dashboardState?.debtBreakdown?.length 
    ? (dashboardState.debtBreakdown.reduce((sum, debt) => sum + debt.interestRate, 0) / dashboardState.debtBreakdown.length).toFixed(1) + '%'
    : 'N/A';
  
  // Calculate time until debt-free (mock data)
  const debtFreeMonths = 36; // Example: 3 years
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + debtFreeMonths);
  const debtFreeDateFormatted = debtFreeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
  // Define tab data structure for better organization
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    { 
      id: 'accounts', 
      label: 'Bank Accounts',
      icon: <Building className="h-4 w-4" />
    },
    { 
      id: 'debts', 
      label: 'My Debts',
      icon: <CreditCard className="h-4 w-4" />
    },
    { 
      id: 'projections', 
      label: 'Projections',
      icon: <BarChart className="h-4 w-4" />
    }
  ];
  
  // Full dashboard view with all data
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
        custom={0}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">Your Dashboard</h1>
          <p className="text-white/70">Track your debt payoff progress and financial health</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/5 text-white hover:bg-white/10 border-white/20"
              onClick={handleRefreshDashboard}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
        custom={1}
        className="mb-8"
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <TabsList className="w-full bg-white/5 border border-white/10 rounded-full p-1 overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#88B04B] data-[state=active]:to-[#6A9A2D] data-[state=active]:text-white flex items-center gap-2 min-w-[120px]"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
              >
                <TabsContent value="overview" className="mt-0 space-y-8">
                  {dashboardState && (
                    <>
                      {/* Key Metrics Section */}
                      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard 
                          title="Total Debt" 
                          value={formatCurrency(dashboardState.totalDebt || 0)}
                          icon={<CreditCard className="w-4 h-4 text-[#88B04B]" />}
                          trend={dashboardState.monthlyChange < 0 ? "positive" : "negative"}
                          change={formatCurrency(Math.abs(dashboardState.monthlyChange || 0)) + "/mo"}
                          description="Total outstanding debt balance"
                        />
                        
                        <MetricCard 
                          title="Monthly Payment" 
                          value={formatCurrency(dashboardState.monthlyPayment || 0)}
                          icon={<Calendar className="w-4 h-4 text-[#88B04B]" />}
                          description="Current monthly debt payments"
                        />
                        
                        <MetricCard 
                          title="Avg. Interest Rate" 
                          value={averageInterestRate}
                          icon={<TrendingUp className="w-4 h-4 text-[#88B04B]" />}
                          description="Weighted average interest rate"
                        />
                      </section>
                      
                      {/* Debt Breakdown and Next Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <DebtBreakdown 
                            debts={dashboardState.debtBreakdown || []}
                            onAddDebt={handleAddDebt}
                    onViewDetails={handleViewDebtDetails}
                  />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <NextPayment 
                            nextPayment={dashboardState.nextPayment}
                            onViewAllPayments={handleViewAllPayments}
                            onPayNow={handlePayNow}
                          />
                        </div>
                      </div>
                      
                      {/* Financial Insights (Additional section for improved information hierarchy) */}
                      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-white">Financial Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start">
                              <div className="p-2 rounded-lg bg-[#88B04B]/20 mr-3">
                                <Target className="w-4 h-4 text-[#88B04B]" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">Debt-Free Projection</h4>
                                <p className="text-white/70 text-sm">
                                  Based on your current payments, you'll be debt-free by <span className="text-white">{debtFreeDateFormatted}</span>.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start">
                              <div className="p-2 rounded-lg bg-[#88B04B]/20 mr-3">
                                <Clock className="w-4 h-4 text-[#88B04B]" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">Payment History</h4>
                                <p className="text-white/70 text-sm">
                                  You've made <span className="text-white">12</span> on-time payments in a row. Great job!
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="accounts" className="mt-0">
                  <div ref={bankConnectionsRef}>
                  <BankConnections 
                    connections={dashboardState?.bankConnections || []}
                      onAddConnection={handleAddConnection}
                      onRefreshConnections={handleRefreshConnections}
                      onManageConnection={handleManageConnection}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="debts" className="mt-0">
                  <DebtBreakdown 
                    debts={dashboardState?.debtBreakdown || []}
                    onAddDebt={handleAddDebt}
                    onViewDetails={handleViewDebtDetails}
                    showFullDetails
                  />
                </TabsContent>
                
                <TabsContent value="projections" className="mt-0">
                  <DebtProjection 
                    strategies={dashboardState?.payoffStrategies || []}
                    onViewDetails={handleViewStrategyDetails}
                    onCreateCustomStrategy={handleCreateCustomStrategy}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>
      
      {/* Refresh Error Dialog */}
      <AlertDialog open={showRefreshError} onOpenChange={setShowRefreshError}>
        <AlertDialogContent className="bg-gray-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Error Refreshing Data</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {refreshError || 'There was an issue refreshing your dashboard data. Please try again later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border border-white/20 text-white hover:bg-white/10">Close</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRefreshDashboard} 
              className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white hover:opacity-90"
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Connect Bank Account Dialog */}
      <AlertDialog open={showConnectAlert} onOpenChange={setShowConnectAlert}>
        <AlertDialogContent className="bg-gray-900 border border-white/10 text-white max-w-md">
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#88B04B]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">Connect Your Accounts</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70 text-center">
                Link your bank accounts to automatically import your debts and track your financial progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <BankConnections 
                compact
                connections={[]}
                onAddConnection={handleAddConnection}
                onRefreshConnections={handleRefreshConnections}
                onManageConnection={handleManageConnection}
              />
            </div>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel className="bg-white/5 border border-white/20 text-white hover:bg-white/10 mt-0">
                Add Manually Later
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  );
}