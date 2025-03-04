import { DollarSign, TrendingDown, Calendar, ChevronRight, Shield, BarChart4, PieChart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

interface OverviewCardsProps {
  totalDebt?: number;
  monthlyPayment?: number;
  projectedPayoffDate?: string;
}

function OverviewCards({ totalDebt = 0, monthlyPayment = 0, projectedPayoffDate }: OverviewCardsProps) {
  const { trackCardInteraction } = useDashboardAnalytics();
  
  const handleCardClick = (cardName: string) => {
    trackCardInteraction(cardName);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Debt Card */}
      <motion.div 
        variants={cardVariants}
        onClick={() => handleCardClick('total-debt')}
        className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#88B04B]/20">
            <DollarSign className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h3 className="text-lg font-semibold text-white">Total Debt</h3>
        </div>
        <p className="text-3xl font-bold text-white mb-2">
          {formatCurrency(totalDebt)}
        </p>
        <div className="flex items-center mt-auto">
          <Badge className="bg-[#88B04B]/20 text-[#88B04B] border-0">
            Your starting point
          </Badge>
        </div>
      </motion.div>
      
      {/* Monthly Payment Card */}
      <motion.div 
        variants={cardVariants}
        onClick={() => handleCardClick('monthly-payment')}
        className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#88B04B]/20">
            <TrendingDown className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h3 className="text-lg font-semibold text-white">Monthly Payment</h3>
        </div>
        <p className="text-3xl font-bold text-white mb-2">
          {formatCurrency(monthlyPayment)}
        </p>
        <div className="flex items-center mt-auto">
          <Badge className="bg-[#88B04B]/20 text-[#88B04B] border-0">
            Current allocation
          </Badge>
        </div>
      </motion.div>
      
      {/* Projected Payoff Date Card */}
      <motion.div 
        variants={cardVariants}
        onClick={() => handleCardClick('payoff-date')}
        className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#88B04B]/20">
            <Calendar className="w-5 h-5 text-[#88B04B]" />
          </div>
          <h3 className="text-lg font-semibold text-white">Projected Payoff</h3>
        </div>
        <p className="text-3xl font-bold text-white mb-2">
          {projectedPayoffDate || 'Not enough data'}
        </p>
        <div className="flex items-center mt-auto">
          <Badge className="bg-[#88B04B]/20 text-[#88B04B] border-0">
            Your destination
          </Badge>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(OverviewCards); 