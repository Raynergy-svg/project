'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

// Section wrapper with optimized loading and animations
const Section = ({ children, id = "", className = "" }: SectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { 
    margin: "-10% 0px",
    amount: 0.1,
    once: true
  });
  
  return (
    <section
      ref={sectionRef}
      className={`relative scroll-section ${className}`} 
      id={id}
    >
      <div className="relative z-10">
          {children}
      </div>
    </section>
  );
};

export default Section; 