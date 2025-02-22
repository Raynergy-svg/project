import { motion } from 'framer-motion';
import { liquidFill } from '@/lib/animations';

interface LiquidFillProps {
  percentage: number;
  color?: string;
}

export function LiquidFill({ percentage, color = '#88B04B' }: LiquidFillProps) {
  return (
    <div className="relative w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 bottom-0"
        style={{ backgroundColor: color }}
        variants={liquidFill}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        custom={percentage}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}