import { useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function useParallax(distance = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [distance, -distance]),
    springConfig
  );

  return { ref, y };
}