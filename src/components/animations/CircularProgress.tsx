import { motion } from 'framer-motion';
import type { CircularProgressProps } from '@/types';

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#88B04B',
  label
}: CircularProgressProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = ((100 - normalizedProgress) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate="visible"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="transition-all duration-500"
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ 
            strokeDasharray: circumference,
            strokeDashoffset: progressOffset
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.svg>
      {/* Percentage text - perfectly centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {normalizedProgress}%
        </span>
        {label && (
          <span className="text-sm text-white/60 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}