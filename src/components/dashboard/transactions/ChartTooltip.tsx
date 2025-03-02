import { ChartTooltipProps } from '@/types/financialTypes';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

/**
 * Custom tooltip component for charts
 */
export const ChartTooltip = ({ 
  active, 
  payload, 
  totalValue = 0 
}: ChartTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const percentage = data.value / totalValue;

  return (
    <div className="bg-gray-900 p-2 rounded-md border border-white/10 text-xs" role="tooltip">
      <p className="text-white font-medium">{data.name}</p>
      <p className="text-[#88B04B]">{formatCurrency(data.value)}</p>
      <p className="text-white/60">{formatPercentage(percentage)} of spending</p>
    </div>
  );
};

export default ChartTooltip; 