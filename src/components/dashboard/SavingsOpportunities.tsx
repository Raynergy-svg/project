import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, PiggyBank, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function SavingsOpportunities() {
  const { isLoading, analytics, metrics } = useDashboardAnalytics();
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [implementedOpportunities, setImplementedOpportunities] = useState<Set<string>>(new Set());
  
  // Initialize implemented opportunities
  useEffect(() => {
    if (analytics?.savingsOpportunities) {
      // In a real app, this would come from the backend
      const implemented = new Set<string>();
      setImplementedOpportunities(implemented);
    }
  }, [analytics]);
  
  const toggleImplemented = (id: string) => {
    setImplementedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    // In a real app, this would update the state and backend
    console.log(`Toggling implementation status for opportunity ${id}`);
  };
  
  if (isLoading || !analytics || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
            >
              <div className="h-24 animate-pulse flex flex-col justify-between">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-8 w-32 bg-white/10 rounded"></div>
                <div className="h-3 w-40 bg-white/10 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="h-64 animate-pulse flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/10 mb-4"></div>
            <div className="h-4 w-48 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-64 bg-white/10 rounded"></div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Calculate savings goal based on current debt
  const currentSavings = 12500; // This would come from the API in a real app
  const savingsGoal = Math.max(25000, Math.round(metrics.potentialSavings));
  const monthlyContribution = 350; // This would come from the API in a real app
  const recommendedContribution = Math.round(monthlyContribution * 1.2); // 20% increase
  
  // Calculate time to goal
  const timeToGoalCurrent = Math.ceil((savingsGoal - currentSavings) / monthlyContribution);
  const timeToGoalOptimized = Math.ceil((savingsGoal - currentSavings) / recommendedContribution);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Savings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Current Savings</h3>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(currentSavings)}</div>
            <div className="text-sm text-white/60 mt-1">
              {formatCurrency(monthlyContribution)}/month contribution
            </div>
          </div>
        </motion.div>

        {/* Savings Goal Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Savings Goal</h3>
            <PiggyBank className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">{formatCurrency(savingsGoal)}</div>
            <div className="text-sm text-white/60 mt-1">
              {Math.round((currentSavings / savingsGoal) * 100)}% of goal reached
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${(currentSavings / savingsGoal) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Time to Goal Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Time to Goal</h3>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white">{timeToGoalCurrent} months</div>
              <ArrowRight className="mx-2 h-4 w-4 text-white/50" />
              <div className="text-3xl font-bold text-emerald-400">{timeToGoalOptimized} months</div>
            </div>
            <div className="text-sm text-white/60 mt-1">
              Save {timeToGoalCurrent - timeToGoalOptimized} months with optimizations
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommended Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Savings Opportunities</h3>
          <div className="text-sm text-white/60">
            {implementedOpportunities.size} of {analytics.savingsOpportunities.length} implemented
          </div>
        </div>
        
        <div className="space-y-4">
          {analytics.savingsOpportunities.map((opportunity) => {
            const isImplemented = implementedOpportunities.has(opportunity.id);
            return (
              <div 
                key={opportunity.id}
                onClick={() => setSelectedOpportunity(opportunity.id === selectedOpportunity ? null : opportunity.id)}
                className={`p-4 rounded-lg transition-colors cursor-pointer ${
                  selectedOpportunity === opportunity.id 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : isImplemented 
                      ? 'bg-white/10 border border-emerald-500/20' 
                      : 'bg-black/30 hover:bg-black/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isImplemented ? 'bg-emerald-500/20' : 'bg-white/10'
                    }`}>
                      {isImplemented ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-white/70" />
                      )}
                    </div>
                    <h4 className="font-medium text-white">{opportunity.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      opportunity.difficulty === 'easy' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : opportunity.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {opportunity.difficulty.charAt(0).toUpperCase() + opportunity.difficulty.slice(1)}
                    </span>
                  </div>
                </div>
                
                {selectedOpportunity === opportunity.id && (
                  <div className="mt-4 pl-10">
                    <p className="text-white/70 text-sm mb-2">{opportunity.description}</p>
                    <p className="text-emerald-400 text-sm font-medium mb-3">
                      {formatCurrency(opportunity.monthlySavings)}/month · {formatCurrency(opportunity.annualSavings)}/year
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImplemented(opportunity.id);
                      }}
                      variant={isImplemented ? "outline" : "default"}
                      className={isImplemented ? "bg-white/10 text-white/70 hover:bg-white/20" : ""}
                    >
                      {isImplemented ? 'Mark as Not Implemented' : 'Mark as Implemented'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Optimize Savings Plan */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Optimize Your Savings Plan</h3>
            <p className="text-white/70 text-sm mt-1">
              Increase monthly contribution from {formatCurrency(monthlyContribution)} to {formatCurrency(recommendedContribution)}
            </p>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center space-x-2">
            <span>Apply Changes</span>
            <PiggyBank className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 