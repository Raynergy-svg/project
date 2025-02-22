import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FeaturePanelProps {
  title: string;
  icon: React.ReactNode;
  sections: {
    title: string;
    content: string;
  }[];
}

export function FeaturePanel({ title, icon, sections }: FeaturePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstSectionRef = useRef<HTMLDivElement>(null);
  
  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        panelRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !panelRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (!dropdownRef.current || e.key !== 'Tab') return;

      const focusableElements = dropdownRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('mousedown', handleClickOutside);
    
    if (firstSectionRef.current) {
      firstSectionRef.current.focus();
    }

    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isExpanded, handleClose]);

  return (
    <div className="relative w-full h-full" ref={panelRef}>
      <div
        className={`h-full p-6 sm:p-8 rounded-xl cursor-pointer transition-all duration-300 ${
          isExpanded ? 'bg-white/5 relative z-50' : 'hover:bg-white/5'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls="feature-dropdown"
        aria-haspopup="true"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Poppins'] truncate">
              {title}
            </h3>
          </div>
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-6 h-6 text-[#88B04B]" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleClose}
              aria-hidden="true"
            />

            <motion.div
              ref={dropdownRef}
              id="feature-dropdown"
              role="region"
              aria-label={`${title} details`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:absolute md:inset-x-0 md:top-full md:translate-y-0 z-50 md:mt-2 max-h-[80vh] md:max-h-[600px] overflow-hidden"
            >
              <div className="relative mx-auto max-w-2xl md:max-w-none">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl" />
                
                <div className="relative bg-[#1E1E1E]/95 rounded-xl border border-white/10 shadow-2xl">
                  <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] md:max-h-[500px] overflow-y-auto custom-scrollbar">
                    {sections.map((section, index) => (
                      <div
                        key={index}
                        ref={index === 0 ? firstSectionRef : null}
                        className="space-y-2 focus:outline-none"
                        tabIndex={0}
                      >
                        <h4 className="text-lg sm:text-xl font-semibold text-white font-['Poppins']">
                          {section.title}
                        </h4>
                        <p className="text-base sm:text-lg text-gray-300 font-['Inter'] leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}