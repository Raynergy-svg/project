import { useState, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';

interface DebtProjectionProps {
  totalDebt: number;
  projectedPayoffDate?: string;
  projectionData: Array<{ month: number; balance: number }>;
}

// Memoized chart component to prevent unnecessary re-renders
const ProjectionChart = memo(({ projectionData }: { projectionData: Array<{ month: number; balance: number }> }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Format data for the chart
  const chartData = projectionData.map((point) => ({
    name: `Month ${point.month}`,
    balance: point.balance
  }));
  
  // Measure container width for responsive chart
  useEffect(() => {
    if (chartRef.current) {
      setContainerWidth(chartRef.current.offsetWidth);
      
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(chartRef.current);
      return () => {
        if (chartRef.current) {
          resizeObserver.disconnect();
        }
      };
    }
  }, []);
  
  if (!chartData?.length) {
    return <Skeleton variant="chart" height="16rem" />;
  }
  
  return (
    <div ref={chartRef} className="h-64 w-full rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
            tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#88B04B" 
            strokeWidth={3}
            dot={{ fill: '#88B04B', r: 4 }}
            activeDot={{ r: 6, fill: '#ffffff', stroke: '#88B04B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Exported component
function DebtProjection({ totalDebt, projectedPayoffDate, projectionData }: DebtProjectionProps) {
  // Analytics hook
  const { trackCardInteraction } = useDashboardAnalytics();

  const handleInteraction = () => {
    trackCardInteraction('debt-projection');
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
            <TrendingDown className="text-[#88B04B]" /> 
            Debt Projection
          </h3>
          {projectedPayoffDate && (
            <div className="px-3 py-1 rounded-full bg-[#88B04B]/20 text-[#88B04B] text-sm font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Debt-free by {projectedPayoffDate}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 mb-1 text-sm">Current Total Debt</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalDebt)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 mb-1 text-sm">Projected Months to Freedom</p>
            <p className="text-2xl font-bold text-white">
              {projectionData.length > 0 ? projectionData.length : '—'}
            </p>
          </div>
        </div>

        {projectionData.length > 0 ? (
          <ProjectionChart projectionData={projectionData} />
        ) : (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/80 mb-2">Not enough data for projection</p>
            <p className="text-sm text-white/60">
              Add your debts to see how quickly you can become debt-free.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(DebtProjection);