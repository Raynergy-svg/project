import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumFeaturePreviewProps {
  title: string;
  description: string;
  imageUrl: string;
  onTryPremium: () => void;
}

export function PremiumFeaturePreview({
  title,
  description,
  imageUrl,
  onTryPremium
}: PremiumFeaturePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] rounded-xl overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent z-10" />
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#88B04B]" />
          <span className="text-[#88B04B] font-medium">Premium Feature</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/80 mb-6">
          {description}
        </p>

        <Button
          onClick={onTryPremium}
          className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
        >
          Try Premium Free for 7 Days
        </Button>
      </div>
    </motion.div>
  );
}