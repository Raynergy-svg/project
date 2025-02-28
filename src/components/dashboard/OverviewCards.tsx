import { motion } from 'framer-motion';
import { Wallet, TrendingDown, Scale, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DashboardState } from '@/hooks/useDashboard';

export interface OverviewCardsProps {
  data: DashboardState;
  onAIToggle?: () => void;
}

export function OverviewCards({ data, onAIToggle }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-[#88B04B]/20">
            <Wallet className="w-5 h-5 text-[#88B04B]" />
          </div>
          <TrendingDown className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-sm text-white/60">Total Debt</h3>
        <p className="text-2xl font-bold text-white mt-1">
          ${data.totalDebt.toLocaleString()}
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="text-emerald-400">↓ ${Math.abs(data.monthlyChange).toLocaleString()}</span>
          <span className="text-white/40">from last month</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Scale className="w-5 h-5 text-purple-400" />
          </div>
          <Badge variant="outline" className="text-[#88B04B]">Active</Badge>
        </div>
        <h3 className="text-sm text-white/60">Debt-to-Income Ratio</h3>
        <p className="text-2xl font-bold text-white mt-1">{data.debtToIncomeRatio}%</p>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="text-emerald-400">↓ 3%</span>
          <span className="text-white/40">improving</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Brain className="w-5 h-5 text-amber-400" />
          </div>
          <Switch checked={data.isAIEnabled} onCheckedChange={onAIToggle} />
        </div>
        <h3 className="text-sm text-white/60">AI Optimization</h3>
        <p className="text-2xl font-bold text-white mt-1">{data.aiOptimizationScore}%</p>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="text-[#88B04B]">Optimized</span>
          <span className="text-white/40">payment strategy</span>
        </div>
      </motion.div>
    </div>
  );
} 