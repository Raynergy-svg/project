import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  label: string;
  value: number;
  trend?: string;
  trendIcon?: React.ReactNode;
  trendIsPositive?: boolean;
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendIcon,
  trendIsPositive,
  badge,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-xl bg-white/5 border-white/10 border ${className}`}>
      <div className="text-white/60 text-xs mb-1">{label}</div>
      <div className="flex items-baseline">
        <div className="text-2xl text-white font-medium">
          {formatCurrency(value)}
        </div>
        
        {trend && (
          <span 
            className={`ml-2 text-xs ${trendIsPositive ? 'text-green-400' : 'text-red-400'}`}
            title={`${trendIsPositive ? 'Increase' : 'Decrease'} of ${trend}`}
          >
            {trendIcon && <span className="inline mr-0.5">{trendIcon}</span>}
            {trend}
          </span>
        )}
        
        {badge && (
          <Badge className="ml-2 bg-[#88B04B]/20 text-[#88B04B]">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default StatCard; 