import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardState } from '@/hooks/useDashboard';

// Define the Insight interface to match the structure in DashboardState
interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'achievement';
  potentialSavings?: number;
  confidence: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AIFinancialInsightsProps {
  insights: DashboardState['insights'];
  isLoading: boolean;
}

export function AIFinancialInsights({ insights, isLoading }: AIFinancialInsightsProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Sparkles className="w-5 h-5 text-[#88B04B]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-[#88B04B]/20 text-[#88B04B]';
      case 'warning':
        return 'bg-amber-400/20 text-amber-400';
      case 'achievement':
        return 'bg-emerald-400/20 text-emerald-400';
    }
  };

  const getInsightGradient = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'from-[#88B04B]/10 to-transparent';
      case 'warning':
        return 'from-amber-400/10 to-transparent';
      case 'achievement':
        return 'from-emerald-400/10 to-transparent';
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
            <Brain className="w-5 h-5 text-[#88B04B]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Financial Insights</h2>
            <p className="text-white/60">Personalized recommendations based on your data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#88B04B]">
          <Brain className="w-5 h-5" />
          <span className="hidden md:inline">Updated in real-time</span>
          <span className="relative flex h-3 w-3 md:hidden">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#88B04B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#88B04B]"></span>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-white/20 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#88B04B] rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-white/60 animate-pulse">Analyzing your financial data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl bg-gradient-to-r ${getInsightGradient(insight.type)} border border-white/5 hover:border-white/10 transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <Badge variant="outline" className={getInsightColor(insight.type)}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mt-1">{insight.description}</p>
                  
                  {insight.potentialSavings && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-[#88B04B] font-medium">
                        Save ${insight.potentialSavings.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {insight.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2"
                      onClick={insight.action.onClick}
                    >
                      {insight.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/5 p-4 rounded-full inline-block mb-4">
                <Lightbulb className="w-12 h-12 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No insights available yet
              </h3>
              <p className="text-white/60 mb-4">
                Connect more accounts or wait for our AI to analyze your data
              </p>
              <div className="inline-flex items-center gap-2 text-[#88B04B] animate-pulse">
                <Brain className="w-5 h-5" />
                <span>AI is learning your financial patterns</span>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
} 