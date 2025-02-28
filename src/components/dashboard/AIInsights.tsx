import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: {
    moneySaved: number;
  };
}

interface AIInsightsProps {
  recommendations: AIRecommendation[];
  onApplyRecommendation?: (id: string) => void;
}

export function AIInsights({ recommendations, onApplyRecommendation }: AIInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
          <p className="text-white/60">Personalized recommendations</p>
        </div>
        <div className="flex items-center gap-2 text-[#88B04B]">
          <Brain className="w-5 h-5" />
          <span>Updated 5m ago</span>
        </div>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#88B04B]/20">
                <Sparkles className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div>
                <h3 className="font-medium text-white">{rec.title}</h3>
                <p className="text-sm text-white/60 mt-1">{rec.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onApplyRecommendation?.(rec.id)}
                  >
                    Apply Now
                  </Button>
                  <div className="text-sm text-[#88B04B]">
                    Save ${rec.impact.moneySaved}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
} 