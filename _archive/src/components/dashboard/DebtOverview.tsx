import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend,
  Tooltip
} from 'recharts';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { DebtOverviewProps } from '@/types';

const COLORS = [
  '#88B04B', // Primary green
  '#FF6B6B', // Coral red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage green
];

export function DebtOverview({ debts, isLoading, onDebtUpdate }: DebtOverviewProps) {
  const { isMdAndUp } = useBreakpoint();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10"
      >
        <LoadingState className="h-[250px] sm:h-[350px]" />
      </motion.div>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  
  const data = debts.map(debt => ({
    name: debt.type.charAt(0).toUpperCase() + debt.type.slice(1).replace('_', ' '),
    value: debt.amount,
    percentage: debt.amount / totalDebt,
    interestRate: debt.interestRate,
    minimumPayment: debt.minimumPayment
  }));

  // Sort data by amount in descending order
  data.sort((a, b) => b.value - a.value);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    // Only show labels for segments > 15%
    if (percent < 0.15) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] sm:text-xs font-medium"
      >
        {formatPercentage(percent)}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20 text-xs sm:text-sm">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-[#88B04B]">
            {formatCurrency(data.value)}
          </p>
          <p className="text-white/80">
            {formatPercentage(data.percentage)} of total
          </p>
          <p className="text-white/80">
            Interest: {formatPercentage(data.interestRate)}
          </p>
          <p className="text-white/80">
            Min Payment: {formatCurrency(data.minimumPayment)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendContent = (props: any) => {
    const { payload } = props;
    return (
      <ul className={`flex flex-wrap gap-1.5 justify-center md:justify-start ${
        isMdAndUp ? 'flex-col' : 'flex-row'
      }`}>
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80 text-xs whitespace-nowrap">
              {entry.value}: {formatPercentage(data[index].percentage)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10"
    >
      <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Debt Composition</h2>
      <p className="text-sm sm:text-base text-white/80 mb-4">
        Total Debt: <span className="font-bold">{formatCurrency(totalDebt)}</span>
      </p>
      
      <div className="h-[250px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isMdAndUp ? 60 : 45}
              outerRadius={isMdAndUp ? 100 : 75}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={renderLegendContent}
              layout={isMdAndUp ? "vertical" : "horizontal"}
              align={isMdAndUp ? "right" : "center"}
              verticalAlign={isMdAndUp ? "middle" : "bottom"}
              wrapperStyle={{
                paddingLeft: isMdAndUp ? "16px" : "0",
                paddingTop: !isMdAndUp ? "16px" : "0"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4">
        {data.map((debt, index) => (
          <div 
            key={index}
            className="bg-white/5 p-2.5 sm:p-3 rounded-lg"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <h3 className="text-white font-semibold text-xs sm:text-sm">{debt.name}</h3>
            </div>
            <p className="text-[#88B04B] text-xs sm:text-sm">{formatCurrency(debt.value)}</p>
            <p className="text-white/60 text-xs">
              {formatPercentage(debt.percentage)} of total
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}