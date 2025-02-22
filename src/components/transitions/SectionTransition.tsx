import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface SectionTransitionProps {
  children: React.ReactNode;
  from: string;
  to: string;
}

export function SectionTransition({ children, from, to }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1, 0.8]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [100, 0, -100]
  );

  return (
    <div ref={ref} className="relative min-h-[50vh] py-20">
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, ${from}, ${to})`,
          opacity
        }}
      />
      <motion.div
        style={{
          scale,
          y,
          opacity
        }}
      >
        {children}
      </motion.div>
    </div>
  );
} 