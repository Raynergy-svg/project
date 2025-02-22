import { motion } from 'framer-motion';
import { progressBar } from '@/lib/animations';
import type { ProgressBarProps } from '@/types';

export function ProgressBar({ 
  progress, 
  label, 
  color = '#88B04B',
  className = ''
}: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-2">
        <span className="text-white/80 text-sm font-medium">{label}</span>
        <span className="text-white/80 text-sm font-medium">{normalizedProgress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          variants={progressBar}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          custom={normalizedProgress}
        />
      </div>
    </div>
  );
}