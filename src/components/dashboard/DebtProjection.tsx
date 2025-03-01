import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DebtProjection() {
  const [activeStrategy, setActiveStrategy] = useState<'standard' | 'accelerated' | 'optimized'>('optimized');
  const { isLoading, analytics, metrics } = useDashboardAnalytics();
  
  if (isLoading || !analytics || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
            >
              <div className="h-24 animate-pulse flex flex-col justify-between">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-8 w-32 bg-white/10 rounded"></div>
                <div className="h-3 w-40 bg-white/10 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
        >
          <div className="h-64 animate-pulse flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/10 mb-4"></div>
            <div className="h-4 w-48 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-64 bg-white/10 rounded"></div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Format projection data for the chart
  const chartData = analytics.projections.map(projection => ({
    name: projection.month,
    standard: projection.amount,
    optimized: projection.withOptimization,
  }));
  
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
              {activeStrategy === 'standard' 
                ? analytics.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : analytics.optimizedPayoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }
            </div>
            <div className="text-sm text-white/60 mt-1">
              {activeStrategy === 'optimized' && (
                <span className="text-[#88B04B] flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {analytics.monthsSaved} months earlier than standard plan
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
              {formatCurrency(activeStrategy === 'standard' ? 
                metrics.timeToDebtFree.standard : 
                metrics.timeToDebtFree.optimized)}
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
            <div className="text-3xl font-bold text-white">{formatCurrency(analytics.interestSaved)}</div>
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
          <div className="flex space-x-2 bg-black/30 rounded-lg p-1">
            {(['standard', 'accelerated', 'optimized'] as const).map((strategy) => (
              <button
                key={strategy}
                onClick={() => setActiveStrategy(strategy)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeStrategy === strategy 
                    ? 'bg-[#88B04B] text-black font-medium' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Real Chart Implementation */}
        <div className="h-64 w-full rounded-lg">
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
                tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                stroke="#4299e1" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Standard Plan"
              />
              <Line 
                type="monotone" 
                dataKey="optimized" 
                stroke="#88B04B" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Optimized Plan"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#88B04B] mr-2"></div>
            <span className="text-sm text-white/70">Optimized Plan</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
            <span className="text-sm text-white/70">Standard Plan</span>
          </div>
        </div>
      </motion.div>

      {/* Payment Strategy Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-lg font-medium text-white mb-4">Recommended Payment Strategy</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-[#88B04B]/20 p-2 rounded-full">
              <ArrowRight className="h-5 w-5 text-[#88B04B]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Increase monthly payment by ${analytics.recommendedExtraPayment}</h4>
              <p className="text-sm text-white/70 mt-1">
                Adding just ${analytics.recommendedExtraPayment} to your monthly payment will reduce your payoff time by {Math.round(analytics.monthsSaved / 3)} months and save ${Math.round(analytics.interestSaved / 2)} in interest.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-[#88B04B]/20 p-2 rounded-full">
              <ArrowRight className="h-5 w-5 text-[#88B04B]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Pay off {analytics.bestDebtToTarget.category} debt first</h4>
              <p className="text-sm text-white/70 mt-1">
                {analytics.bestDebtToTarget.reason} - this will have the highest impact on your finances.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-black/30">
            <div className="bg-[#88B04B]/20 p-2 rounded-full">
              <ArrowRight className="h-5 w-5 text-[#88B04B]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Consider debt consolidation</h4>
              <p className="text-sm text-white/70 mt-1">
                Based on your credit score of {analytics.creditScoreImpact.current}, you may qualify for a consolidation loan at a lower interest rate.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 