import { motion } from 'framer-motion';
import { TrendingUp, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

export function CreditScoreWidget() {
  const { isLoading, analytics } = useDashboardAnalytics();

  if (isLoading || !analytics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#88B04B]/30 to-emerald-500/20">
            <Shield className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Credit Score</h2>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 mb-4"></div>
            <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-48 bg-white/10 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Helper function to get color based on credit score
  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-400';
    if (score >= 700) return 'text-[#88B04B]';
    if (score >= 650) return 'text-amber-400';
    return 'text-red-400';
  };

  // Helper function to get progress color based on credit score
  const getProgressColor = (score: number) => {
    if (score >= 750) return 'bg-emerald-400';
    if (score >= 700) return 'bg-[#88B04B]';
    if (score >= 650) return 'bg-amber-400';
    return 'bg-red-400';
  };

  // Helper function to get credit score rating
  const getCreditScoreRating = (score: number) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
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
            <Shield className="w-5 h-5 text-[#88B04B]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Credit Score</h2>
            <p className="text-white/60 text-sm">Powered by TransUnion</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-5 h-5 text-white/40 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-black/90 border-white/10 text-white">
              <p className="max-w-xs">
                Credit scores range from 300-850. Higher scores may qualify you for better interest rates.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
            <div className={`text-4xl font-bold ${getCreditScoreColor(analytics.creditScoreImpact.current)}`}>
              {analytics.creditScoreImpact.current}
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-[#88B04B]/20 p-2 rounded-full">
            <TrendingUp className="w-5 h-5 text-[#88B04B]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">
            {getCreditScoreRating(analytics.creditScoreImpact.current)}
          </p>
          <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
            <span>300</span>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(analytics.creditScoreImpact.current)}`}
                style={{ width: `${((analytics.creditScoreImpact.current - 300) / 550) * 100}%` }}
              ></div>
            </div>
            <span>850</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Projected Score</h3>
          <div className={`text-lg font-bold ${getCreditScoreColor(analytics.creditScoreImpact.projected)}`}>
            {analytics.creditScoreImpact.projected}
          </div>
        </div>
        <Progress 
          value={analytics.creditScoreImpact.projected} 
          max={850} 
          min={300}
          className="h-2 bg-white/10" 
          indicatorClassName={getProgressColor(analytics.creditScoreImpact.projected)} 
        />
        <p className="text-white/60 text-sm mt-2">
          Potential improvement in {analytics.creditScoreImpact.timeframe}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="text-white font-medium mb-2">Recommended Actions</h3>
        {analytics.creditScoreImpact.actions.map((action, index) => (
          <div 
            key={index} 
            className="flex items-start gap-2 text-sm text-white/70"
          >
            <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5" />
            <span>{action}</span>
          </div>
        ))}
      </div>

      <Button className="w-full gap-2">
        View Full Credit Report
        <Shield className="w-4 h-4" />
      </Button>
    </motion.div>
  );
} 