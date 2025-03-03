import { memo } from 'react';
import { Plus, ArrowRight, CreditCard, Home, Car, GraduationCap, Briefcase, FileText, RefreshCw, Link, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Debt } from '@/lib/dashboardConstants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useChartColorScheme } from '@/hooks/useChartOptimization';

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

export interface DebtBreakdownProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onViewDetails: (debtId: string) => void;
}

// Memoized PieChart component to prevent unnecessary re-renders
const DebtPieChart = memo(({ debts }) => {
  const colors = useChartColorScheme(debts.length);
  
  // Prepare data for pie chart
  const chartData = debts.map((debt, index) => ({
    name: debt.category,
    value: debt.amount,
    color: DEBT_CATEGORY_DISPLAY[debt.category]?.color || colors[index]
  }));
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
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
  );
});

export const DebtBreakdown = memo(function DebtBreakdown({ debts, onAddDebt, onViewDetails }: DebtBreakdownProps) {
  // Calculate totals
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Debt Breakdown</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-white border-white/20 hover:bg-white/10" 
          onClick={() => onAddDebt({
            id: crypto.randomUUID(),
            category: 'Credit Card',
            amount: 0,
            interestRate: 0,
            minimumPayment: 0,
            name: '',
          })}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Debt
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center lg:col-span-1">
          {debts.length > 0 ? (
            <DebtPieChart debts={debts} />
          ) : (
            <div className="text-center p-6 bg-black/30 rounded-xl">
              <p className="text-white/60">No debt information available</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4 text-white border-white/20 hover:bg-white/10"
                onClick={() => onAddDebt({
                  id: crypto.randomUUID(),
                  category: 'Credit Card',
                  amount: 0,
                  interestRate: 0,
                  minimumPayment: 0,
                  name: '',
                })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Your First Debt
              </Button>
            </div>
          )}
        </div>
        
        {/* Debt List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {debts.length === 0 ? (
              <div className="text-center p-6 bg-black/30 rounded-xl">
                <p className="text-white/60">No debt information available</p>
              </div>
            ) : (
              <>
                {/* Debt totals */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-black/30 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">Total Debt</p>
                    <p className="text-2xl font-bold text-white">${totalDebt.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-black/30 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">Monthly Payments</p>
                    <p className="text-2xl font-bold text-white">${totalMonthlyPayment.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* List of debts */}
                <div className="space-y-3">
                  {debts.map((debt) => (
                    <div 
                      key={debt.id} 
                      className="p-4 bg-black/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-black/40 transition-colors"
                      onClick={() => onViewDetails(debt.id)}
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-[#88B04B]/20 mr-3">
                          {DEBT_CATEGORY_DISPLAY[debt.category]?.icon || <FileText className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{debt.name || debt.category}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge className="bg-white/10 text-white/60 text-xs">
                              ${debt.amount.toLocaleString()}
                            </Badge>
                            <Badge className="bg-white/10 text-white/60 text-xs">
                              {debt.interestRate}% APR
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Add default export for lazy loading
export default DebtBreakdown; 