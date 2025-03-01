import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

export function SavingsOpportunities() {
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
            <Sparkles className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Savings Opportunities</h2>
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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-400/20">
            Easy
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-400/20">
            Medium
          </Badge>
        );
      case 'hard':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-400/20">
            Complex
          </Badge>
        );
      default:
        return null;
    }
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
            <Sparkles className="w-5 h-5 text-[#88B04B]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Savings Opportunities</h2>
            <p className="text-white/60 text-sm">AI-identified ways to save money</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#88B04B]">
          <DollarSign className="w-5 h-5" />
          <span className="hidden md:inline">Potential savings</span>
        </div>
      </div>

      <div className="space-y-4">
        {analytics.savingsOpportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="p-4 rounded-xl bg-gradient-to-r from-[#88B04B]/10 to-transparent border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#88B04B]/20 text-[#88B04B]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{opportunity.title}</h3>
                  {getDifficultyBadge(opportunity.difficulty)}
                </div>
                <p className="text-sm text-white/60 mt-1">{opportunity.description}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">
                      Save ${opportunity.monthlySavings}/mo
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-medium">
                      ${opportunity.annualSavings}/year
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {analytics.savingsOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/5 p-4 rounded-full inline-block mb-4">
              <CheckCircle className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No savings opportunities found
            </h3>
            <p className="text-white/60 mb-4">
              Your finances are already well optimized!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 