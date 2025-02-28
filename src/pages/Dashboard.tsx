import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useDashboard } from '@/hooks/useDashboard';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { DebtBreakdown } from '@/components/dashboard/DebtBreakdown';
import { AIFinancialInsights } from '@/components/dashboard/AIFinancialInsights';
import { NextPayment } from '@/components/dashboard/NextPayment';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { BankConnections } from '@/components/dashboard/BankConnections';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LlamaAIAssistant } from '@/components/dashboard/LlamaAIAssistant';

export default function Dashboard() {
  const { user } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const { 
    isLoading, 
    error, 
    dashboardState,
    handleAIToggle,
    handleAddDebt,
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment
  } = useDashboard();

  if (!user || !isOnboardingComplete) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-black to-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70 animate-pulse">Analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-black to-gray-900">
        <div className="bg-black/40 border border-red-500/20 backdrop-blur-sm p-8 rounded-2xl max-w-md">
          <p className="text-red-500 text-xl font-semibold mb-2">Error loading dashboard</p>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 pb-16">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#88B04B]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}</h1>
          <p className="text-white/60">Your financial journey is looking better every day</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <OverviewCards data={dashboardState} onAIToggle={handleAIToggle} />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <BankConnections />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NextPayment 
              dueDate="2024-04-15"
              amount={1500}
              isAutomated={true}
              onSchedule={handleSchedulePayment}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DebtBreakdown 
              debts={dashboardState.debtBreakdown}
              onAddDebt={handleAddDebt}
              onViewDetails={handleViewDebtDetails}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <AIFinancialInsights 
              insights={dashboardState.insights}
              isLoading={isLoading}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickStats 
              debtToIncome={dashboardState.debtToIncomeRatio}
              monthlyChange={dashboardState.monthlyChange}
              aiScore={dashboardState.aiOptimizationScore}
            />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <LlamaAIAssistant />
        </motion.div>
      </div>
    </div>
  );
} 