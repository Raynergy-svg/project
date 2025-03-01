import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Zap, DollarSign, PiggyBank, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

interface CategoryAllocation {
  id: string;
  name: string;
  currentAmount: number;
  recommendedAmount: number;
  icon: React.ReactNode;
  color: string;
}

export function BudgetOptimizer() {
  const { isLoading, analytics, metrics } = useDashboardAnalytics();
  const [expanded, setExpanded] = useState(false);
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([
    {
      id: 'housing',
      name: 'Housing',
      currentAmount: 1800,
      recommendedAmount: 1800,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-blue-500',
    },
    {
      id: 'transportation',
      name: 'Transportation',
      currentAmount: 450,
      recommendedAmount: 350,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-green-500',
    },
    {
      id: 'food',
      name: 'Food & Dining',
      currentAmount: 650,
      recommendedAmount: 500,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-amber-500',
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      currentAmount: 300,
      recommendedAmount: 200,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-purple-500',
    },
    {
      id: 'savings',
      name: 'Savings',
      currentAmount: 400,
      recommendedAmount: 650,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'bg-[#88B04B]',
    },
  ]);

  // Calculate total current and recommended amounts
  const totalCurrent = allocations.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalRecommended = allocations.reduce((sum, item) => sum + item.recommendedAmount, 0);
  
  // Calculate potential monthly savings
  const potentialSavings = allocations
    .filter(item => item.id !== 'savings')
    .reduce((sum, item) => sum + Math.max(0, item.currentAmount - item.recommendedAmount), 0);

  const handleAllocationChange = (id: string, value: number[]) => {
    setAllocations(prev => 
      prev.map(item => 
        item.id === id ? { ...item, recommendedAmount: value[0] } : item
      )
    );
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Budget Optimizer</h2>
            <p className="text-white/60 text-sm">AI-powered recommendations</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Potential Monthly Savings</h3>
          <div className="text-lg font-bold text-[#88B04B]">${potentialSavings}</div>
        </div>
        <p className="text-white/60 text-sm">
          By optimizing your budget, you could save ${potentialSavings} monthly and ${potentialSavings * 12} annually.
        </p>
      </div>

      {expanded && (
        <div className="space-y-4 mb-6">
          {allocations.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${category.color}/20`}>
                    {category.icon}
                  </div>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">Current: ${category.currentAmount}</span>
                  <ArrowRight className="w-3 h-3 text-white/40" />
                  <span className={`text-sm font-medium ${
                    category.id === 'savings' 
                      ? 'text-[#88B04B]' 
                      : category.recommendedAmount < category.currentAmount 
                        ? 'text-emerald-400' 
                        : 'text-white'
                  }`}>
                    ${category.recommendedAmount}
                  </span>
                </div>
              </div>
              <Slider
                value={[category.recommendedAmount]}
                min={category.id === 'savings' ? category.currentAmount : Math.max(0, category.currentAmount - 300)}
                max={category.id === 'savings' ? category.currentAmount + 300 : category.currentAmount + 100}
                step={10}
                onValueChange={(value) => handleAllocationChange(category.id, value)}
                className="w-full"
              />
              {category.id === 'savings' && category.recommendedAmount > category.currentAmount && (
                <p className="text-xs text-[#88B04B]">
                  Increasing your savings by ${category.recommendedAmount - category.currentAmount} can help you reach your financial goals faster.
                </p>
              )}
              {category.id !== 'savings' && category.recommendedAmount < category.currentAmount && (
                <p className="text-xs text-emerald-400">
                  Reducing {category.name.toLowerCase()} expenses by ${category.currentAmount - category.recommendedAmount} is recommended.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20">
        <div>
          <h3 className="text-white font-medium">Apply AI Recommendations</h3>
          <p className="text-white/60 text-sm">Optimize your budget with one click</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Zap className="w-4 h-4" />
          Optimize
        </Button>
      </div>
    </motion.div>
  );
} 