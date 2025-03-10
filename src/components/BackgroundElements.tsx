'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Animation variants
const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  static: { y: 0 },
};

// Background elements with visibility optimization
const BackgroundElements = () => {
  const { prefersReducedMotion } = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { margin: "-10%" });

  if (prefersReducedMotion || isMobile) {
    return null;
  }

  return (
    <div ref={elementRef} className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <AnimatePresence>
        {isInView && (
          <>
            <motion.div
              key="bg-1"
              variants={floatingVariants}
              animate="float"
              initial="static"
              exit="static"
              className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] hardware-accelerated"
              style={{ 
                willChange: "transform", 
                contain: "paint",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            />
            <motion.div
              key="bg-2"
              variants={floatingVariants}
              animate="float"
              initial="static"
              exit="static"
              style={{ 
                x: 100, 
                willChange: "transform", 
                contain: "paint",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
              className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] hardware-accelerated"
            />
            <motion.div
              key="bg-3"
              className="absolute inset-0 opacity-5 pointer-events-none"
            >
              <div 
                className="h-full w-full"
                style={{ 
                  backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }} 
              />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" 
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30 pointer-events-none" 
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackgroundElements; 