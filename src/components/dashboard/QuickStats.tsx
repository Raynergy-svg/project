import { motion } from 'framer-motion';

export interface QuickStatsProps {
  debtToIncome: number;
  monthlyChange: number;
  aiScore: number;
}

export function QuickStats({ debtToIncome, monthlyChange, aiScore }: QuickStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Quick Stats</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <span className="text-white/60">Debt to Income</span>
          <span className="text-[#88B04B] font-medium">
            {debtToIncome.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <span className="text-white/60">Monthly Change</span>
          <span className="text-[#88B04B] font-medium">
            {monthlyChange.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <span className="text-white/60">AI Score</span>
          <span className="text-white font-medium">
            {aiScore.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
} 