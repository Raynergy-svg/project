import { memo, useMemo } from 'react';
import { Plus, ArrowRight, CreditCard, Home, Car, GraduationCap, Briefcase, FileText, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Debt } from '@/lib/dashboardConstants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useChartColorScheme } from '@/hooks/useChartOptimization';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

// Define a mapping for debt category icons
const DEBT_CATEGORY_DISPLAY = {
  'Credit Card': {
    icon: <CreditCard className="w-3 h-3 text-[#88B04B]" />,
    color: '#88B04B'
  },
  'Mortgage': {
    icon: <Home className="w-3 h-3 text-[#88B04B]" />,
    color: '#A4C88B'
  },
  'Auto Loan': {
    icon: <Car className="w-3 h-3 text-[#88B04B]" />,
    color: '#B4D7A4'
  },
  'Student Loan': {
    icon: <GraduationCap className="w-3 h-3 text-[#88B04B]" />,
    color: '#C5E1BD'
  },
  'Personal Loan': {
    icon: <Briefcase className="w-3 h-3 text-[#88B04B]" />,
    color: '#D6EAD6'
  },
  'Medical Debt': {
    icon: <FileText className="w-3 h-3 text-[#88B04B]" />,
    color: '#E8F4EF'
  },
  'Other': {
    icon: <FileText className="w-3 h-3 text-white" />,
    color: '#A9A9A9'
  }
};

// Animation variants
const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    }
  }),
};

export interface DebtBreakdownProps {
  debts: Debt[];
  onAddNewDebt: () => void;
  onViewDebtDetails: (debtId: string) => void;
}

function DebtBreakdown({ debts, onAddNewDebt, onViewDebtDetails }: DebtBreakdownProps) {
  const { trackCardInteraction } = useDashboardAnalytics();
  
  const handleInteraction = () => {
    trackCardInteraction('debt-breakdown');
  };
  
  // Calculate total debt
  const totalDebt = useMemo(() => 
    debts.reduce((sum, debt) => sum + debt.currentBalance, 0), 
    [debts]
  );
  
  // Prepare pie chart data
  const chartData = useMemo(() => {
    if (!debts.length) return [];
    
    return debts.map(debt => ({
      name: debt.name,
      value: debt.currentBalance,
      category: debt.category,
    }));
  }, [debts]);
  
  // Get colors for the chart
  const colors = useChartColorScheme(debts.length || 1, '#88B04B');
  
  // Calculate percentage of each debt relative to total
  const calculatePercentage = (amount: number) => {
    if (!totalDebt) return 0;
    return Math.round((amount / totalDebt) * 100);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleInteraction}
      className="bg-[#2A2A2A] rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-[#88B04B]" /> 
            Debt Breakdown
          </h3>
          <Button 
            onClick={onAddNewDebt}
            className="bg-[#88B04B] hover:bg-[#79A042] text-black"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        </div>
        
        {debts.length === 0 ? (
          <div className="text-center p-6 bg-white/5 rounded-lg">
            <p className="text-white/80 mb-3">No debts added yet</p>
            <p className="text-sm text-white/60 mb-4">
              Add your debts to see a breakdown and track your progress to becoming debt-free.
            </p>
            <Button 
              onClick={onAddNewDebt}
              className="bg-[#88B04B] hover:bg-[#79A042] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Debt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="flex justify-center items-center p-4 bg-white/5 rounded-lg h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DEBT_CATEGORY_DISPLAY[entry.category]?.color || colors[index % colors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Balance']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Debt List */}
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {debts.map((debt, index) => (
                <motion.div
                  key={debt.id}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeInVariants}
                  onClick={() => onViewDebtDetails(debt.id)}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#88B04B]/20">
                        {DEBT_CATEGORY_DISPLAY[debt.category]?.icon || 
                          DEBT_CATEGORY_DISPLAY['Other'].icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{debt.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-transparent border-white/20 text-white/70">
                            {debt.category}
                          </Badge>
                          <span className="text-xs text-white/50">
                            {debt.interestRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(debt.currentBalance)}</p>
                      <p className="text-xs text-white/50">
                        {calculatePercentage(debt.currentBalance)}% of total
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(DebtBreakdown); 