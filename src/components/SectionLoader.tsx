'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Loading component with fade transition and mobile optimization
const SectionLoader = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const minHeight = isMobile ? '200px' : '400px';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center py-6"
      style={{ minHeight }}
    >
      <LoadingSpinner />
    </motion.div>
  );
};

export default SectionLoader; 