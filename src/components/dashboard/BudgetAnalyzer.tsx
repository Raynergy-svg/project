import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { BudgetAnalyzerProps } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart as BarChartIcon, ArrowRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DashboardState } from '@/hooks/useDashboard';

const COLORS = ['#88B04B', '#6A8F3D', '#4A6B2F', '#2D4D1E', '#1E3311'];

// Additional props for simplified budget analyzer
interface SimpleBudgetAnalyzerProps {
  budgetCategories?: {
    name: string;
    allocated: number;
    spent: number;
    color: string;
  }[];
  monthlySpending?: {
    month: string;
    amount: number;
  }[];
  totalBudget?: number;
  totalSpent?: number;
  onCreateBudget?: () => void;
  onAdjustBudget?: (category: string) => void;
}

// Dashboard state props interface
interface DashboardStateProps {
  dashboardState: DashboardState;
  onCreateBudget?: () => void;
  onAdjustBudget?: (category: string) => void;
}

// Type guard to check which props we're dealing with
function isStandardBudgetProps(props: any): props is BudgetAnalyzerProps {
  return props.budget !== undefined;
}

function isDashboardStateProps(props: any): props is DashboardStateProps {
  return props.dashboardState !== undefined;
}

export function BudgetAnalyzer(props: BudgetAnalyzerProps | SimpleBudgetAnalyzerProps | DashboardStateProps) {
  if (isStandardBudgetProps(props)) {
    return <StandardBudgetAnalyzer {...props} />;
  } else if (isDashboardStateProps(props)) {
    return <SimplifiedBudgetAnalyzer 
      budgetCategories={props.dashboardState.budgetCategories}
      monthlySpending={props.dashboardState.monthlySpending}
      totalBudget={props.dashboardState.totalBudget}
      totalSpent={props.dashboardState.totalSpent}
      onCreateBudget={props.onCreateBudget}
      onAdjustBudget={props.onAdjustBudget}
    />;
  } else {
    return <SimplifiedBudgetAnalyzer {...props} />;
  }
}

function StandardBudgetAnalyzer({ 
  budget, 
  isEditable = true,
  onUpdateBudget 
}: BudgetAnalyzerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { isMdAndUp } = useBreakpoint();

  // Calculate total expenses
  const totalExpenses = budget?.expenses.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;
  
  // Calculate percentage for each expense
  const data = budget?.expenses.map(expense => ({
    name: expense.category,
    amount: expense.amount,
    percentage: expense.amount / totalExpenses,
    description: expense.description
  })) ?? [];

  // Sort data by amount in descending order
  data.sort((a, b) => b.amount - a.amount);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.[0]) {
      return (
        <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 text-sm sm:text-base">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-[#88B04B]">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-white/80">
            {formatPercentage(payload[0].payload.percentage)} of total
          </p>
          {payload[0].payload.description && (
            <p className="text-white/80 text-sm mt-1">
              {payload[0].payload.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleUpdateBudget = async (updatedBudget: typeof budget) => {
    try {
      await onUpdateBudget(updatedBudget);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  if (!budget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10"
      >
        <LoadingState className="h-[300px] sm:h-[400px]" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Budget Analysis</h2>
          <p className="text-sm sm:text-base text-white/60">
            Monthly Income: {formatCurrency(budget.monthlyIncome)}
          </p>
        </div>
        {isEditable && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="border-white/20 text-white hover:border-[#88B04B] hover:text-[#88B04B]"
          >
            {isEditing ? 'Done' : 'Edit Budget'}
          </Button>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-base sm:text-lg text-white">
            Total Expenses: {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm sm:text-base text-white/60">
            Remaining: {formatCurrency(budget.monthlyIncome - totalExpenses)}
          </p>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#88B04B]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalExpenses / budget.monthlyIncome) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px] mb-4 sm:mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ 
              top: 20, 
              right: isMdAndUp ? 30 : 10, 
              left: isMdAndUp ? 20 : 10, 
              bottom: 30 
            }}
            barSize={isMdAndUp ? 40 : 30}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: isMdAndUp ? 12 : 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: isMdAndUp ? 12 : 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => formatCurrency(value)}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-white/80 text-sm">{value}</span>}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar 
              dataKey="amount" 
              name="Expense Amount"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 border-t border-white/10 pt-4"
        >
          {/* Add expense form would go here */}
          <p className="text-white/60 text-sm">
            Edit mode enabled. Add or modify expenses here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Simplified version for when we don't have a full budget object yet
function SimplifiedBudgetAnalyzer({ 
  budgetCategories = [],
  monthlySpending = [],
  totalBudget = 0,
  totalSpent = 0,
  onCreateBudget,
  onAdjustBudget
}: SimpleBudgetAnalyzerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate budget metrics
  const budgetRemaining = totalBudget - totalSpent;
  const budgetPercentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;
  
  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-white/70">Allocated:</span>
            <span className="text-white">${data.allocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-white/70">Spent:</span>
            <span className="text-white">${data.spent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm mt-1">
            <span className="text-white/70">Remaining:</span>
            <span className={data.allocated - data.spent >= 0 ? "text-emerald-400" : "text-red-400"}>
              ${(data.allocated - data.spent).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for the bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-white/70">Spent:</span>
            <span className="text-white">${payload[0].value.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
            <DollarSign className="w-5 h-5 text-[#88B04B]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Budget Analyzer</h2>
            <p className="text-white/60">Track and optimize your spending</p>
          </div>
        </div>
        {budgetCategories.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onAdjustBudget ? () => onAdjustBudget('all') : undefined}
          >
            Adjust Budget
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {budgetCategories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#88B04B]" />
                <span className="text-white/70">Total Budget</span>
              </div>
              <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70">Spent So Far</span>
                <Badge 
                  variant="outline" 
                  className={isOverBudget ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}
                >
                  {isOverBudget ? 'Over Budget' : 'Within Budget'}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                {isOverBudget ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-white/70">Remaining</span>
              </div>
              <p className={`text-2xl font-bold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
                ${Math.abs(budgetRemaining).toLocaleString()}
                <span className="text-sm ml-1">{isOverBudget ? 'over' : 'left'}</span>
              </p>
            </motion.div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70">Budget Usage</span>
              <span className="text-white">{budgetPercentUsed.toFixed(1)}%</span>
            </div>
            <Progress 
              value={budgetPercentUsed > 100 ? 100 : budgetPercentUsed} 
              max={100} 
              className="h-2 bg-white/10" 
              indicatorClassName={
                budgetPercentUsed > 90 
                  ? "bg-red-400" 
                  : budgetPercentUsed > 75 
                    ? "bg-amber-400" 
                    : "bg-[#88B04B]"
              } 
            />
            {budgetPercentUsed > 90 && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>You're approaching your budget limit</span>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                <span>Category Breakdown</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <BarChartIcon className="w-4 h-4" />
                <span>Spending Trends</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="spent"
                    >
                      {budgetCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {budgetCategories.map((category, index) => {
                  const percentUsed = (category.spent / category.allocated) * 100;
                  const isOverCategoryBudget = category.spent > category.allocated;
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">{category.name}</span>
                          <span className="text-xs text-white/70">
                            ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={percentUsed > 100 ? 100 : percentUsed} 
                          max={100} 
                          className="h-1.5 mt-1 bg-white/10" 
                          indicatorClassName={
                            isOverCategoryBudget 
                              ? "bg-red-400" 
                              : percentUsed > 80 
                                ? "bg-amber-400" 
                                : "bg-[#88B04B]"
                          } 
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-0">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      fill="#88B04B" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white/70 text-sm">Monthly Average</p>
                  <p className="text-white font-medium">
                    ${monthlySpending.length > 0 
                      ? (monthlySpending.reduce((sum, item) => sum + item.amount, 0) / monthlySpending.length).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Highest Month</p>
                  <p className="text-white font-medium">
                    ${monthlySpending.length > 0 
                      ? Math.max(...monthlySpending.map(item => item.amount)).toLocaleString()
                      : '0'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Lowest Month</p>
                  <p className="text-white font-medium">
                    ${monthlySpending.length > 0 
                      ? Math.min(...monthlySpending.map(item => item.amount)).toLocaleString()
                      : '0'
                    }
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white/5 p-4 rounded-xl inline-block mb-4">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No budget set up yet</h3>
          <p className="text-white/60 mb-4">Create a budget to track your spending and save more</p>
          <Button 
            onClick={onCreateBudget}
            className="gap-2"
          >
            Create Your First Budget
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}