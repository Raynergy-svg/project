import { useEffect, useRef, useState } from 'react';
import '../../styles/animation-effects.css';

interface CelebrationEffectProps {
  onComplete?: () => void;
}

interface Confetti {
  id: number;
  color: string;
  x: number;
  rotation: number;
}

export default function CelebrationEffect({ onComplete }: CelebrationEffectProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate confetti particles
  useEffect(() => {
    // Colors in our theme
    const colors = ['#88B04B', '#76973F', '#9AC95B', '#556B2F', '#CFFF8D'];
    const newConfetti: Confetti[] = [];
    
    // Create 100 confetti pieces
    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 2 - 1, // Value between -1 and 1 for random-x CSS variable
        rotation: Math.random() * 2 - 1 // Value between -1 and 1 for random-rotate CSS variable
      });
    }
    
    setConfetti(newConfetti);
    
    // Trigger animations in sequence
    setShowFlash(true);
    
    setTimeout(() => {
      setShowSuccessIcon(true);
    }, 300);
    
    // Clean up
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <>
      {/* Flash effect */}
      <div className={`success-flash ${showFlash ? 'flash-animation' : ''}`} />
      
      {/* Success icon */}
      <div className={`success-icon ${showSuccessIcon ? 'success-icon-animation' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      {/* Confetti container */}
      <div ref={containerRef} className="celebration-container">
        {confetti.map((item) => (
          <div
            key={item.id}
            className="confetti confetti-animation"
            style={{
              backgroundColor: item.color,
              left: `${Math.random() * 100}%`,
              '--random-x': item.x.toString(),
              '--random-rotate': item.rotation.toString()
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
} 