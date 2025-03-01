import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Zap, DollarSign, PiggyBank, ArrowRight, PieChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { DashboardState } from '@/hooks/useDashboard';
import { BudgetCategory } from '@/services/financialAnalysis';

interface CategoryAllocation {
  id: string;
  name: string;
  currentAmount: number;
  recommendedAmount: number;
  icon: React.ReactNode;
  color: string;
}

interface BudgetOptimizerProps {
  dashboardState: DashboardState;
  onAdjustBudget: (category: string, newAmount: number) => void;
}

export function BudgetOptimizer({ dashboardState, onAdjustBudget }: BudgetOptimizerProps) {
  const { isLoading, analytics, metrics } = useDashboardAnalytics();
  const [expanded, setExpanded] = useState(false);
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([]);

  // Initialize allocations from dashboardState
  useEffect(() => {
    if (dashboardState && dashboardState.budgetCategories) {
      const icons = {
        Housing: <DollarSign className="w-4 h-4" />,
        Transportation: <PiggyBank className="w-4 h-4" />,
        Food: <PieChart className="w-4 h-4" />,
        Entertainment: <TrendingUp className="w-4 h-4" />,
        Utilities: <Zap className="w-4 h-4" />,
        Healthcare: <PiggyBank className="w-4 h-4" />,
        Shopping: <DollarSign className="w-4 h-4" />,
        Other: <PieChart className="w-4 h-4" />
      };

      const newAllocations = dashboardState.budgetCategories.map((category: BudgetCategory) => ({
        id: category.name.toLowerCase().replace(/\s+/g, '-'),
        name: category.name,
        currentAmount: category.amount,
        recommendedAmount: category.allocated,
        icon: icons[category.name as keyof typeof icons] || <DollarSign className="w-4 h-4" />,
        color: category.color
      }));

      setAllocations(newAllocations);
    }
  }, [dashboardState]);

  // Calculate total current and recommended amounts
  const totalCurrent = allocations.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalRecommended = allocations.reduce((sum, item) => sum + item.recommendedAmount, 0);
  
  // Calculate potential monthly savings
  const potentialSavings = allocations
    .filter(item => item.id !== 'savings')
    .reduce((sum, item) => sum + Math.max(0, item.currentAmount - item.recommendedAmount), 0);

  const handleAllocationChange = (id: string, value: number[]) => {
    const newValue = value[0];
    
    // Update local state
    setAllocations(prev => 
      prev.map(item => 
        item.id === id ? { ...item, recommendedAmount: newValue } : item
      )
    );
    
    // Call the parent handler with the category name and new amount
    const category = allocations.find(item => item.id === id);
    if (category) {
      onAdjustBudget(category.name, newValue);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Budget Optimizer</h2>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 mb-4"></div>
            <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-48 bg-white/10 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Budget Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Current Budget</h3>
            <PieChart className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">${totalCurrent}</div>
            <div className="text-sm text-white/60 mt-1">
              Monthly expenses
            </div>
          </div>
        </motion.div>

        {/* Optimized Budget Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Optimized Budget</h3>
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">${totalRecommended}</div>
            <div className="text-sm text-white/60 mt-1">
              Recommended monthly expenses
            </div>
          </div>
        </motion.div>

        {/* Potential Savings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Potential Savings</h3>
            <DollarSign className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-purple-400">+${potentialSavings}</div>
            <div className="text-sm text-white/60 mt-1">
              Monthly savings with optimized budget
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Budget Breakdown</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-white/70 mr-2"></div>
              <span className="text-sm text-white/70">Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
              <span className="text-sm text-white/70">Optimized</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {allocations.map((category) => (
            <div 
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`p-4 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === category.name 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-black/30 hover:bg-black/40'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">{category.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-white/70">${category.currentAmount}</span>
                  <ArrowRight className="h-3 w-3 text-white/50" />
                  <span className={`${
                    category.recommendedAmount < category.currentAmount ? 'text-purple-400' : 'text-white/70'
                  }`}>${category.recommendedAmount}</span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/70 rounded-full"
                  style={{ width: `${(category.currentAmount / totalCurrent) * 100}%` }}
                ></div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${(category.recommendedAmount / totalRecommended) * 100}%` }}
                ></div>
              </div>
              
              {category.recommendedAmount !== category.currentAmount && (
                <div className="text-right mt-1">
                  <span className={`text-xs ${
                    category.recommendedAmount < category.currentAmount ? 'text-purple-400' : 'text-white/70'
                  }`}>
                    {Math.abs(Math.round(((category.recommendedAmount - category.currentAmount) / category.currentAmount) * 100))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Optimization Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-lg font-medium text-white mb-4">Budget Optimization Recommendations</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Reduce entertainment expenses</h4>
              <p className="text-sm text-white/70 mt-1">
                Consider free or low-cost entertainment options like community events, hiking, or movie nights at home.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Optimize transportation costs</h4>
              <p className="text-sm text-white/70 mt-1">
                Consider carpooling, public transportation, or combining errands to save on fuel costs.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Meal planning for food savings</h4>
              <p className="text-sm text-white/70 mt-1">
                Plan meals in advance, buy groceries in bulk, and reduce dining out to save $100/month on food expenses.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Apply Optimized Budget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Apply Optimized Budget</h3>
            <p className="text-white/70 text-sm mt-1">
              Save ${potentialSavings} monthly with these optimizations
            </p>
          </div>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center space-x-2">
            <span>Apply Changes</span>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
} 