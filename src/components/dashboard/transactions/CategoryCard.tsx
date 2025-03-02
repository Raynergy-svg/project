import React from 'react';
import { SpendingCategory } from '@/types/financialTypes';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { DollarSign } from 'lucide-react';
import { categoryIconsMapping } from '@/data/sampleFinancialData';

interface CategoryCardProps {
  category: SpendingCategory;
  totalExpenses: number;
  className?: string;
  renderIcon: (name: string, color: string) => React.ReactNode;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  totalExpenses, 
  className = '',
  renderIcon 
}) => {
  const { name, value, color } = category;
  const percentage = value / totalExpenses;
  
  return (
    <div className={`flex items-center p-2 rounded-lg bg-white/5 border border-white/10 ${className}`}>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        {renderIcon(name, color)}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <p className="text-sm text-white font-medium">{name}</p>
          <p className="text-sm text-white font-medium">{formatCurrency(value)}</p>
        </div>
        <div 
          className="w-full bg-white/10 h-1.5 rounded-full mt-1"
          role="progressbar"
          aria-valuenow={percentage * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div 
            className="h-full rounded-full" 
            style={{ 
              width: `${Math.min(percentage * 100, 100)}%`,
              backgroundColor: color 
            }} 
          />
        </div>
        <p className="text-xs text-white/60 mt-1">{formatPercentage(percentage)} of total spending</p>
      </div>
    </div>
  );
};

export default CategoryCard; 