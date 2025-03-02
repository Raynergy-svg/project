import React, { useMemo } from 'react';
import { PieChart, Cell, ResponsiveContainer, Pie } from 'recharts';
import { Filter, DollarSign, Home, ShoppingBag, Car, Coffee, Utensils, Gift, CreditCard, Plane, Smartphone, Shield, GraduationCap, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpendingCategory } from '@/types/financialTypes';
import { calculateTotalExpenses, calculateAverageDailySpend, sortCategoriesByValue } from '@/utils/financialCalculations';
import { formatCurrency } from '@/utils/formatters';
import ChartTooltip from './ChartTooltip';
import CategoryCard from './CategoryCard';
import EmptyState from './EmptyState';

// Map of category names to their corresponding icons
const categoryIcons: Record<string, React.ReactNode> = {
  'Housing': <Home className="w-4 h-4" />,
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Entertainment': <Smartphone className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Bills & Utilities': <CreditCard className="w-4 h-4" />,
  'Health': <Coffee className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
  'Insurance': <Shield className="w-4 h-4" />,
  'Education': <GraduationCap className="w-4 h-4" />,
  'Gifts': <Gift className="w-4 h-4" />,
  'Groceries': <ShoppingCart className="w-4 h-4" />,
  'Other': <DollarSign className="w-4 h-4" />,
};

interface SpendingTabProps {
  spendingCategories: SpendingCategory[];
  days?: number;
  onFilter?: (filterType: string) => void;
  className?: string;
}

export const SpendingTab: React.FC<SpendingTabProps> = ({
  spendingCategories,
  days = 30,
  onFilter,
  className = '',
}) => {
  // Memoize calculated values
  const totalExpenses = useMemo(() => 
    calculateTotalExpenses(spendingCategories), 
    [spendingCategories]
  );
  
  const sortedCategories = useMemo(() => 
    sortCategoriesByValue(spendingCategories), 
    [spendingCategories]
  );
  
  const averageDailySpend = useMemo(() => 
    calculateAverageDailySpend(totalExpenses, days), 
    [totalExpenses, days]
  );

  // Function to render the appropriate icon for each category
  const renderCategoryIcon = (name: string, color: string) => {
    const IconComponent = categoryIcons[name] || <DollarSign className="w-4 h-4" />;
    return React.cloneElement(IconComponent as React.ReactElement, { style: { color } });
  };

  // If no spending data
  if (spendingCategories.length === 0) {
    return (
      <EmptyState
        icon={<PieChart className="h-10 w-10" />}
        message="No spending data available for this period"
        actionText="Connect an account"
        onAction={() => console.log('Connect account')}
        className={className}
      />
    );
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      <div className="w-full md:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Spending by Category</h3>
          <Badge className="bg-white/10 text-white/70">Last {days} days</Badge>
        </div>
        
        <div className="h-64" aria-label="Spending categories pie chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {spendingCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip totalValue={totalExpenses} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-white/60">Total Monthly Spending</p>
          <p className="text-2xl font-bold text-white" aria-label={`Total spending: ${formatCurrency(totalExpenses)}`}>
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Top Spending Categories</h3>
          {onFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFilter('category')}
              className="gap-1 text-xs h-7 px-2 bg-white/5 text-white/70 border-white/10"
              aria-label="Filter categories"
            >
              <Filter className="w-3 h-3" /> Filter
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {sortedCategories.slice(0, 6).map((category, index) => (
            <CategoryCard 
              key={`${category.name}-${index}`}
              category={category}
              totalExpenses={totalExpenses}
              renderIcon={renderCategoryIcon}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-4">
          <p className="text-xs text-white/60">Average Daily Spend</p>
          <p className="text-xs font-medium text-white">{formatCurrency(averageDailySpend)}</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingTab; 