import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface QuickStatsProps {
  debtToIncome: number;
  monthlyChange: number;
  aiScore: number;
}

export function QuickStats({ debtToIncome, monthlyChange, aiScore }: QuickStatsProps) {
  // Helper function to determine if a value is positive or negative
  const isPositive = (value: number) => value >= 0;
  
  // Helper function to get color based on value
  const getColor = (value: number, inverse: boolean = false) => {
    const isGood = inverse ? !isPositive(value) : isPositive(value);
    return isGood ? 'text-emerald-400' : 'text-red-400';
  };

  // Helper function to get icon based on value
  const getTrendIcon = (value: number, inverse: boolean = false) => {
    const isGood = inverse ? !isPositive(value) : isPositive(value);
    return isGood ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
          <BarChart3 className="w-5 h-5 text-[#88B04B]" />
        </div>
        <h2 className="text-xl font-semibold text-white">Quick Stats</h2>
      </div>
      
      <div className="space-y-5">
        <motion.div 
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span className="text-white/70">Debt to Income Ratio</span>
            </div>
            <div className={`flex items-center gap-1 ${getColor(debtToIncome - 50, true)}`}>
              {getTrendIcon(debtToIncome - 50, true)}
              <span className="font-medium">
                {debtToIncome}%
              </span>
            </div>
          </div>
          <Progress 
            value={debtToIncome} 
            max={100} 
            className="h-2 bg-white/10" 
            indicatorClassName={debtToIncome > 50 ? "bg-red-400" : "bg-emerald-400"} 
          />
          <p className="text-xs text-white/50 mt-2">
            {debtToIncome > 50 
              ? "High ratio. Consider reducing debt or increasing income." 
              : "Healthy ratio. Keep up the good work!"}
          </p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#88B04B]" />
              <span className="text-white/70">Monthly Change</span>
            </div>
            <div className={`flex items-center gap-1 ${getColor(-monthlyChange)}`}>
              {getTrendIcon(-monthlyChange)}
              <span className="font-medium">
                ${Math.abs(monthlyChange).toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/50">
            {monthlyChange < 0 
              ? "Your debt decreased this month. Great progress!" 
              : "Your debt increased this month. Let's work on reducing it."}
          </p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#88B04B] to-emerald-400 flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">AI</span>
              </div>
              <span className="text-white/70">AI Optimization Score</span>
            </div>
            <span className="text-white font-medium">
              {aiScore}%
            </span>
          </div>
          <Progress 
            value={aiScore} 
            max={100} 
            className="h-2 bg-white/10" 
            indicatorClassName="bg-gradient-to-r from-[#88B04B] to-emerald-400" 
          />
          <p className="text-xs text-white/50 mt-2">
            {aiScore > 80 
              ? "Your finances are well optimized!" 
              : aiScore > 50 
                ? "Good optimization. Some improvements possible." 
                : "Consider applying AI recommendations to improve your score."}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
} 