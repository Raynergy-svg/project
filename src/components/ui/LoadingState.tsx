import { motion } from 'framer-motion';
import { shimmer } from '@/lib/animations';

interface LoadingStateProps {
  width?: string;
  height?: string;
  className?: string;
}

export function LoadingState({ width = '100%', height = '20px', className = '' }: LoadingStateProps) {
  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="visible"
      className={`rounded-lg ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #1E1E1E 25%, #2A2A2A 50%, #1E1E1E 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}