import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useDashboard } from '@/hooks/useDashboard';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { DebtBreakdown } from '@/components/dashboard/DebtBreakdown';
import { NextPayment } from '@/components/dashboard/NextPayment';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AIFinancialInsights } from '@/components/dashboard/AIFinancialInsights';
import { BudgetAnalyzer } from '@/components/dashboard/BudgetAnalyzer';
import { BankConnections } from '@/components/dashboard/BankConnections';
import { AIDebtAssistant } from '@/components/dashboard/AIDebtAssistant';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { DebtProjection } from '@/components/dashboard/DebtProjection';
import { SavingsOpportunities } from '@/components/dashboard/SavingsOpportunities';
import { CreditScoreWidget } from '@/components/dashboard/CreditScoreWidget';
import { BudgetOptimizer } from '@/components/dashboard/BudgetOptimizer';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { isOnboardingComplete, setOnboardingComplete } = useOnboarding(user?.id);
  const { 
    isLoading, 
    dashboardState, 
    handleAIToggle,
    handleAddDebt,
    handleViewDebtDetails,
    handleApplyRecommendation,
    handleSchedulePayment,
    handleCreateBudget,
    handleAdjustBudget
  } = useDashboard();

  if (!user || !isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {!isOnboardingComplete && user && (
          <UserOnboarding onComplete={setOnboardingComplete} />
        )}
        {!user && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
            <p>You need to be logged in to view this page.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview Section */}
        <section>
          <OverviewCards 
            data={dashboardState} 
            onAIToggle={handleAIToggle} 
          />
        </section>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <QuickStats
                debtToIncome={dashboardState.debtToIncomeRatio}
                monthlyChange={dashboardState.monthlyChange}
                aiScore={dashboardState.aiOptimizationScore}
              />
            </motion.div>

            {/* Debt Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DebtBreakdown
                debts={dashboardState.debtBreakdown}
                onAddDebt={handleAddDebt}
                onViewDetails={handleViewDebtDetails}
              />
            </motion.div>

            {/* Debt Projection - New Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <DebtProjection />
            </motion.div>

            {/* Budget Analyzer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BudgetAnalyzer
                dashboardState={dashboardState}
                onCreateBudget={handleCreateBudget}
                onAdjustBudget={handleAdjustBudget}
              />
            </motion.div>

            {/* Budget Optimizer - New Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <BudgetOptimizer />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Financial Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AIFinancialInsights
                insights={dashboardState.insights}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Credit Score Widget - New Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <CreditScoreWidget />
            </motion.div>

            {/* Savings Opportunities - New Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SavingsOpportunities />
            </motion.div>

            {/* Next Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <NextPayment
                dueDate="2023-06-15"
                amount={450}
                isAutomated={false}
                onSchedule={handleSchedulePayment}
              />
            </motion.div>

            {/* Bank Connections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BankConnections />
            </motion.div>
          </div>
        </div>

        {/* AI Debt Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <AIDebtAssistant />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}