import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplitPageTransitionProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
  children: React.ReactNode;
}

export function SplitPageTransition({ isOpen, onAnimationComplete, children }: SplitPageTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Top Split */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "-50%" }}
            exit={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-0 left-0 w-full h-full bg-[#1E1E1E] origin-bottom"
          />
          
          {/* Bottom Split */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "50%" }}
            exit={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-0 left-0 w-full h-full bg-[#1E1E1E] origin-top"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onAnimationComplete={() => {
              setIsAnimating(false);
              onAnimationComplete?.();
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 