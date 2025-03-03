import { useState, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartData, useChartColorScheme } from '@/hooks/useChartOptimization';
import { Skeleton, SkeletonCardGrid } from '@/components/ui/Skeleton';
import { Debt, PayoffStrategy } from '@/lib/dashboardConstants';

interface DebtProjectionProps {
  debts: Debt[];
  strategies: PayoffStrategy[];
}

// Memoized chart component to prevent unnecessary re-renders
const ProjectionChart = memo(({ strategies, activeStrategy }) => {
  const chartRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const colors = useChartColorScheme(strategies.length, '#88B04B');
  
  // Get the active strategy data
  const activeStrategyData = strategies.find(s => s.id === activeStrategy) || strategies[0];
  const standardStrategyData = strategies.find(s => s.id === 'avalanche') || strategies[0];
  
  // Create chart data from both strategies for comparison
  const chartData = useChartData(
    activeStrategyData?.projectionData.map((point, index) => ({
      name: `Month ${point.month}`,
      activeStrategy: point.balance,
      standard: standardStrategyData?.projectionData[index]?.balance || 0
    })) || [],
    [activeStrategy, strategies]
  );
  
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
  
  if (!chartData.length) {
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
            formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Line 
            type="monotone" 
            dataKey="standard" 
            stroke="#3b82f6" // blue
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="Standard Plan"
          />
          <Line 
            type="monotone" 
            dataKey="activeStrategy" 
            stroke="#88B04B" // green
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name={`${activeStrategyData?.name || 'Optimized'} Plan`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Memoized strategy selection component
const StrategySelector = memo(({ strategies, activeStrategy, onChange }) => {
  return (
    <div className="flex space-x-2 bg-black/30 rounded-lg p-1">
      {strategies.map((strategy) => (
        <button
          key={strategy.id}
          onClick={() => onChange(strategy.id)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeStrategy === strategy.id 
              ? 'bg-[#88B04B] text-black font-medium' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          {strategy.name}
        </button>
      ))}
    </div>
  );
});

// Main component
const DebtProjectionComponent = memo(function DebtProjection({ debts, strategies }: DebtProjectionProps) {
  const [activeStrategy, setActiveStrategy] = useState(strategies?.[0]?.id || 'avalanche');
  
  // If no data is available, show loading state
  if (!debts.length || !strategies.length) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Debt Projection</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <Skeleton variant="chart" height="16rem" width="100%" />
          <p className="text-white/60 mt-4">Loading projection data...</p>
        </div>
      </div>
    );
  }
  
  // Get current active strategy
  const currentStrategy = strategies.find(s => s.id === activeStrategy) || strategies[0];
  
  // Get standard strategy for comparison
  const standardStrategy = strategies.find(s => s.id === 'avalanche') || strategies[0];
  
  // Calculate months saved
  const monthsSaved = Math.max(0, Math.round(
    (standardStrategy.projectedPayoffDate.getTime() - currentStrategy.projectedPayoffDate.getTime()) / 
    (30 * 24 * 60 * 60 * 1000)
  ));
  
  // Calculate interest saved
  const interestSaved = Math.max(0, standardStrategy.totalInterestPaid - currentStrategy.totalInterestPaid);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Debt Payoff Date Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Projected Payoff</h3>
            <Calendar className="h-5 w-5 text-[#88B04B]" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">
              {currentStrategy.projectedPayoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-sm text-white/60 mt-1">
              {monthsSaved > 0 && activeStrategy !== 'avalanche' && (
                <span className="text-[#88B04B] flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {monthsSaved} months earlier than standard plan
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Monthly Payment Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Monthly Payment</h3>
            <DollarSign className="h-5 w-5 text-[#88B04B]" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">
              ${currentStrategy.monthlyPayment.toLocaleString()}
            </div>
            <div className="text-sm text-white/60 mt-1">
              Optimized for fastest payoff
            </div>
          </div>
        </motion.div>

        {/* Interest Saved Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Interest Saved</h3>
            <DollarSign className="h-5 w-5 text-[#88B04B]" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white">${interestSaved.toLocaleString()}</div>
            <div className="text-sm text-white/60 mt-1">
              With optimized payment strategy
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projection Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Debt Projection Chart</h3>
          
          {/* Strategy Selector */}
          <StrategySelector 
            strategies={strategies}
            activeStrategy={activeStrategy}
            onChange={setActiveStrategy}
          />
        </div>
        
        {/* Enhanced Chart Implementation */}
        <ProjectionChart 
          strategies={strategies} 
          activeStrategy={activeStrategy} 
        />
        
        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#88B04B] mr-2"></div>
            <span className="text-sm text-white/70">{currentStrategy.name}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
            <span className="text-sm text-white/70">Standard Plan</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// Export both named and default exports to maintain backward compatibility
export const DebtProjection = DebtProjectionComponent;
export default DebtProjectionComponent; 