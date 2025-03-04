import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  change?: string;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend = 'neutral', 
  change,
  className
}: MetricCardProps) => {
  // Define trend colors
  const trendConfig = {
    positive: {
      color: 'text-emerald-500',
      icon: <ArrowUpCircle className="w-4 h-4 text-emerald-500" />,
      bgColor: 'bg-emerald-500/10'
    },
    negative: {
      color: 'text-rose-500',
      icon: <ArrowDownCircle className="w-4 h-4 text-rose-500" />,
      bgColor: 'bg-rose-500/10'
    },
    neutral: {
      color: 'text-gray-400',
      icon: <MinusCircle className="w-4 h-4 text-gray-400" />,
      bgColor: 'bg-gray-500/10'
    }
  };

  const { color, icon: trendIcon, bgColor } = trendConfig[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ translateY: -4 }}
      className={cn("transition-all duration-200", className)}
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-[#88B04B]/20">
                  {icon}
                </div>
                <h3 className="text-sm font-medium text-white/70">{title}</h3>
              </div>
              
              <div className="flex items-baseline mt-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                {change && (
                  <div className="flex items-center ml-2 mt-1">
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgColor} ${color} flex items-center gap-1`}>
                      {trendIcon}
                      {change}
                    </div>
                  </div>
                )}
              </div>
              
              {description && (
                <p className="mt-1 text-xs text-white/60">{description}</p>
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#88B04B]/5 rounded-bl-full blur-xl"></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 