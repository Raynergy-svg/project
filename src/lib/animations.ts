import { Variants } from 'framer-motion';

// Shared animation variants with reduced motion
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Progress animations
export const progressBar: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (progress: number) => ({ 
    scaleX: progress / 100,
    transition: { duration: 0.4, ease: 'easeOut' }
  })
};

export const lineGraph: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const staggerList: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const cardFlip: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const circularProgress: Variants = {
  hidden: { 
    pathLength: 0,
    opacity: 0 
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export const pieChart: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

export const shimmer: Variants = {
  hidden: {
    backgroundPosition: '200% 0',
  },
  visible: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const liquidFill: Variants = {
  hidden: { y: '100%' },
  visible: (percentage: number) => ({
    y: `${100 - percentage}%`,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

export const parallaxSection: Variants = {
  hidden: { y: 100 },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 30,
      damping: 20
    }
  }
};

// Export all animations as a group
export const animations = {
  fadeInUp,
  progressBar,
  lineGraph,
  staggerList,
  cardFlip,
  circularProgress,
  pieChart,
  shimmer,
  liquidFill,
  parallaxSection
};