import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialBannerProps {
  daysRemaining: number;
  onUpgrade: () => void;
}

export function TrialBanner({ daysRemaining, onUpgrade }: TrialBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#88B04B] text-white py-2 px-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in your free trial
          </span>
        </div>
        <Button
          onClick={onUpgrade}
          size="sm"
          className="bg-white text-[#88B04B] hover:bg-white/90"
        >
          Upgrade Now
        </Button>
      </div>
    </motion.div>
  );
}