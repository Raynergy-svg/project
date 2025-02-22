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
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { BudgetAnalyzerProps } from '@/types';

const COLORS = ['#88B04B', '#6A8F3D', '#4A6B2F', '#2D4D1E', '#1E3311'];

export function BudgetAnalyzer({ 
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