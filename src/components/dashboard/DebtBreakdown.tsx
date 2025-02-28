import { motion } from 'framer-motion';
import { Plus, ArrowRight, CreditCard, Home, Car, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Debt } from '@/lib/dashboardConstants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Define a mapping for debt category icons and colors
const DEBT_CATEGORY_DISPLAY = {
  'Credit Card': {
    icon: <CreditCard className="w-5 h-5 text-[#FF6B6B]" />,
    color: '#FF6B6B'
  },
  'Mortgage': {
    icon: <Home className="w-5 h-5 text-[#4ECDC4]" />,
    color: '#4ECDC4'
  },
  'Auto Loan': {
    icon: <Car className="w-5 h-5 text-[#45B7D1]" />,
    color: '#45B7D1'
  },
  'Student Loan': {
    icon: <GraduationCap className="w-5 h-5 text-[#96CEB4]" />,
    color: '#96CEB4'
  },
  'Personal Loan': {
    icon: <Briefcase className="w-5 h-5 text-[#FFEEAD]" />,
    color: '#FFEEAD'
  },
  'Medical Debt': {
    icon: <FileText className="w-5 h-5 text-[#FF9F9F]" />,
    color: '#FF9F9F'
  },
  'Other': {
    icon: <FileText className="w-5 h-5 text-[#A9A9A9]" />,
    color: '#A9A9A9'
  }
};

export interface DebtBreakdownProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onViewDetails: (debtId: string) => void;
}

export function DebtBreakdown({ debts, onAddDebt, onViewDetails }: DebtBreakdownProps) {
  // Prepare data for pie chart
  const chartData = debts.map(debt => ({
    name: debt.category,
    value: debt.amount,
    color: DEBT_CATEGORY_DISPLAY[debt.category]?.color || '#A9A9A9'
  }));

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-white/70 text-sm">${payload[0].value.toLocaleString()}</p>
          <p className="text-[#88B04B] text-xs">
            {((payload[0].value / totalDebt) * 100).toFixed(1)}% of total
          </p>
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
        <h2 className="text-xl font-semibold text-white">Debt Breakdown</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2" 
          onClick={() => onAddDebt({ category: 'Credit Card', amount: 0, interestRate: 0, minimumPayment: 0 })}
        >
          <Plus className="w-4 h-4" />
          Add Debt
        </Button>
      </div>

      {debts.length > 0 && (
        <div className="mb-6">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-white/70">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {debts.map((debt, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-2 rounded-lg" 
                style={{ backgroundColor: (DEBT_CATEGORY_DISPLAY[debt.category]?.color || '#A9A9A9') + '20' }}
              >
                {DEBT_CATEGORY_DISPLAY[debt.category]?.icon || <FileText className="w-5 h-5 text-[#A9A9A9]" />}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {debt.category}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-white/60">
                    ${debt.amount.toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {(debt.interestRate * 100).toFixed(1)}% APR
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => onViewDetails(index.toString())}
            >
              Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}

        {debts.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white/5 p-4 rounded-xl inline-block mb-4">
              <FileText className="w-12 h-12 text-white/20 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No debts added yet</h3>
            <p className="text-white/60 mb-4">Add your debts to get personalized insights</p>
            <Button 
              onClick={() => onAddDebt({ category: 'Credit Card', amount: 0, interestRate: 0, minimumPayment: 0 })}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Debt
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 