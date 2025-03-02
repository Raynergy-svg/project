import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IncomeSource, SpendingCategory } from '@/types/financialTypes';
import { calculateTotalIncome, calculateTotalExpenses, calculateNetCashFlow, calculateSavingsRate, sortCategoriesByValue } from '@/utils/financialCalculations';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import StatCard from './StatCard';
import EmptyState from './EmptyState';

interface CashFlowTabProps {
  incomeSources: IncomeSource[];
  spendingCategories: SpendingCategory[];
  className?: string;
}

export const CashFlowTab: React.FC<CashFlowTabProps> = ({
  incomeSources,
  spendingCategories,
  className = '',
}) => {
  // Memoize calculated values
  const totalIncome = useMemo(() => 
    calculateTotalIncome(incomeSources), 
    [incomeSources]
  );
  
  const totalExpenses = useMemo(() => 
    calculateTotalExpenses(spendingCategories), 
    [spendingCategories]
  );
  
  const netCashFlow = useMemo(() => 
    calculateNetCashFlow(totalIncome, totalExpenses), 
    [totalIncome, totalExpenses]
  );
  
  const savingsRate = useMemo(() => 
    calculateSavingsRate(netCashFlow, totalIncome), 
    [netCashFlow, totalIncome]
  );
  
  const topExpenseCategories = useMemo(() => 
    sortCategoriesByValue(spendingCategories).slice(0, 3), 
    [spendingCategories]
  );

  // If no data is available
  if (incomeSources.length === 0 && spendingCategories.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="h-10 w-10" />}
        message="No cash flow data available for this period"
        actionText="Connect an account"
        onAction={() => console.log('Connect account')}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Monthly Income"
          value={totalIncome}
          trend="+5.2%"
          trendIcon={<TrendingUp className="w-3 h-3 inline mr-0.5" />}
          trendIsPositive={true}
        />
        
        <StatCard
          label="Monthly Expenses"
          value={totalExpenses}
          trend="-2.1%"
          trendIcon={<TrendingDown className="w-3 h-3 inline mr-0.5" />}
          trendIsPositive={false}
        />
        
        <StatCard
          label="Net Cash Flow"
          value={netCashFlow}
          badge={netCashFlow >= 0 ? 'Positive' : 'Negative'}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Income Sources</h3>
          {incomeSources.length > 0 ? (
            <div className="space-y-3">
              {incomeSources.map((source, index) => (
                <div 
                  key={`${source.source}-${index}`} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <p className="text-sm text-white">{source.source}</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-white">{formatCurrency(source.amount)}</p>
                    <span 
                      className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#88B04B]/10 text-[#88B04B]"
                      title={`${source.source} makes up ${formatPercentage(source.amount / totalIncome)} of your income`}
                    >
                      {formatPercentage(source.amount / totalIncome)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center text-white/60">
              No income sources available
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Top Expense Categories</h3>
          {topExpenseCategories.length > 0 ? (
            <div className="space-y-3">
              {topExpenseCategories.map((category, index) => (
                <div 
                  key={`${category.name}-${index}`} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center">
                    <div 
                      className="p-1.5 rounded-lg mr-2" 
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <DollarSign className="w-3.5 h-3.5" style={{ color: category.color }} />
                    </div>
                    <p className="text-sm text-white">{category.name}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-white">{formatCurrency(category.value)}</p>
                    <span 
                      className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                      title={`${category.name} makes up ${formatPercentage(category.value / totalExpenses)} of your expenses`}
                    >
                      {formatPercentage(category.value / totalExpenses)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center text-white/60">
              No expense categories available
            </div>
          )}
          
          <div className="mt-4">
            <div className="p-3 rounded-lg bg-[#88B04B]/10 border border-[#88B04B]/20">
              <div className="flex items-start">
                <DollarSign className="w-4 h-4 text-[#88B04B] mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-white">Savings Rate</p>
                  <p className="text-xs text-white/70">
                    You're saving {formatPercentage(savingsRate)} of your income
                  </p>
                  {savingsRate < 0.2 ? (
                    <p className="text-xs text-[#88B04B] mt-1">
                      Try to increase your savings rate to at least 20% for better financial health
                    </p>
                  ) : (
                    <p className="text-xs text-[#88B04B] mt-1">
                      Great job! You're above the recommended 20% savings rate
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowTab; 