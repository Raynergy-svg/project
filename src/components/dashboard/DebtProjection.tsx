import { motion } from 'framer-motion';
import { TrendingDown, Calendar, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

export function DebtProjection() {
  const { isLoading, analytics, metrics } = useDashboardAnalytics();

  if (isLoading || !analytics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
            <TrendingDown className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Debt Projection</h2>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 mb-4"></div>
            <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-48 bg-white/10 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-white/70 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#88B04B]"></span>
            Standard: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-white/70 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Optimized: ${payload[1].value.toLocaleString()}
          </p>
          <p className="text-[#88B04B] text-xs mt-1">
            Difference: ${(payload[0].value - payload[1].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
            <TrendingDown className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Debt Projection</h2>
        </div>
        <Badge variant="outline" className="bg-[#88B04B]/10 text-[#88B04B] border-[#88B04B]/20">
          AI Optimized
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-white/70" />
            <h3 className="text-white/70">Standard Payoff Date</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {format(analytics.payoffDate, 'MMMM yyyy')}
          </p>
          <p className="text-white/50 text-sm mt-1">
            {metrics?.timeToDebtFree?.standard} months to debt freedom
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white/70">Optimized Payoff Date</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-white/40 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black/90 border-white/10 text-white">
                  <p className="max-w-xs">
                    Based on AI-optimized payment strategy and recommended extra payments
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {format(analytics.optimizedPayoffDate, 'MMMM yyyy')}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-emerald-400 text-sm">
              {analytics.monthsSaved} months saved
            </p>
            <p className="text-white/50 text-sm">
              (${analytics.interestSaved.toLocaleString()} interest saved)
            </p>
          </div>
        </div>
      </div>

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={analytics.projections}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-white/80 text-sm">{value}</span>}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              name="Standard Path" 
              stroke="#88B04B" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="withOptimization" 
              name="Optimized Path" 
              stroke="#34D399" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-[#88B04B]/20 to-transparent border border-[#88B04B]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Recommended Extra Payment</h3>
            <p className="text-white/70 text-sm mt-1">
              Adding this amount to your highest interest debt will optimize your payoff strategy
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#88B04B]">
              ${analytics.recommendedExtraPayment}/mo
            </p>
            <p className="text-white/50 text-sm">
              Target: {analytics.bestDebtToTarget.category}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full gap-2">
            Apply Recommendation
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 