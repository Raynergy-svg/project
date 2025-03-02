import { Plus, ArrowRight, CreditCard, Home, Car, GraduationCap, Briefcase, FileText, RefreshCw, Link, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Debt } from '@/lib/dashboardConstants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';

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
        <div className="bg-black/80 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white text-[10px] font-medium">{payload[0].name}</p>
          <p className="text-white/70 text-[10px]">${payload[0].value.toLocaleString()}</p>
          <p className="text-[#88B04B] text-[10px]">
            {((payload[0].value / totalDebt) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
              <FileText className="w-4 h-4 text-[#88B04B]" />
            </div>
            <h2 className="text-lg font-medium text-white">Debt Breakdown</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Auto-synced
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-[#88B04B]/10 border-[#88B04B]/30 text-[#88B04B] hover:bg-[#88B04B]/20 h-8" 
              onClick={() => onAddDebt({ category: 'Credit Card', amount: 0, interestRate: 0, minimumPayment: 0 })}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Debt
            </Button>
          </div>
        </div>
      </div>

      {debts.length > 0 ? (
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-white/60 mb-2">Debt Distribution</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
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
              
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {chartData.slice(0, 4).map((entry, index) => (
                  <div key={index} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-white/70">{entry.name}</span>
                  </div>
                ))}
                {chartData.length > 4 && (
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                    <span className="text-xs text-white/70">+{chartData.length - 4} more</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/80">Your Debts</h3>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-white/60">Last synced 20 min ago</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#88B04B]/20 scrollbar-track-transparent">
                {debts.map((debt, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded-md" 
                        style={{ 
                          backgroundColor: (DEBT_CATEGORY_DISPLAY[debt.category]?.color || '#A9A9A9') + '20',
                          borderColor: (DEBT_CATEGORY_DISPLAY[debt.category]?.color || '#A9A9A9') + '30',
                          borderWidth: '1px'
                        }}
                      >
                        {DEBT_CATEGORY_DISPLAY[debt.category]?.icon || <FileText className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-medium text-sm text-white">
                            {debt.name || debt.category}
                          </h3>
                          {debt.name === 'Chase Sapphire' && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-[9px] px-1 py-0 h-4">Bank Synced</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-white/60">
                            ${debt.amount.toLocaleString()}
                          </p>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                            {(debt.interestRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white/60 hover:text-[#88B04B]"
                      onClick={() => onViewDetails(index.toString())}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        
          <div className="mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs text-white/60">Total Debt</span>
                <p className="text-white text-xl font-medium">${totalDebt.toLocaleString()}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-1 bg-[#88B04B]/10 border-[#88B04B]/30 text-[#88B04B] hover:bg-[#88B04B]/20"
              >
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
              <Link className="w-3 h-3 text-[#88B04B]" />
              <span>Connected to 3 bank accounts for real-time debt tracking</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <div className="bg-[#88B04B]/10 p-4 rounded-lg inline-block mb-3 border border-[#88B04B]/20">
            <FileText className="w-8 h-8 text-[#88B04B]/60 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No debts added yet</h3>
          <p className="text-white/60 mb-4 text-sm max-w-sm mx-auto">Connect your bank accounts or add debts manually to get personalized insights</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => onAddDebt({ category: 'Credit Card', amount: 0, interestRate: 0, minimumPayment: 0 })}
              className="gap-2 bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Debt Manually
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-white/5 border-white/20 text-white"
            >
              <Link className="w-4 h-4" />
              Connect Bank
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 