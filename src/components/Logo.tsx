import { Link } from 'react-router-dom';
import { memo } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLink?: boolean;
}

const LogoContent = memo(({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100'
  };

  const heights = [30, 45, 35, 55];
  const baseWidth = 12;

  return (
    <>
      <div 
        className={`relative h-[50px] w-[70px] ${sizeClasses[size]}`}
        style={{ contain: 'layout paint' }}
      >
        <div className="absolute inset-0 flex items-end justify-start gap-[4px] pb-1">
          {heights.map((height, index) => (
            <div 
              key={index} 
              className="relative" 
              style={{ 
                height: `${height}px`, 
                width: `${baseWidth}px`,
                transform: 'perspective(500px) rotateX(-10deg)',
                willChange: 'transform',
                contain: 'layout paint'
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#88B04B] to-[#6A9A2D]"
                style={{
                  transformOrigin: 'bottom',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  willChange: 'transform',
                  contain: 'paint'
                }}
              />
              
              <div 
                className="absolute top-0 right-[-3px] w-[3px] h-full bg-[#4A7A2A]"
                style={{ 
                  transform: 'skewY(-45deg)',
                  transformOrigin: 'left',
                  willChange: 'transform',
                  contain: 'paint'
                }}
              />
              
              <div 
                className="absolute top-[-3px] left-0 right-0 h-[3px] bg-[#A8D06B]"
                style={{ 
                  transform: 'skewX(-45deg)',
                  transformOrigin: 'bottom',
                  willChange: 'transform',
                  contain: 'paint'
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {showText && (
        <span 
          className="font-bold text-[#88B04B] font-['Poppins'] text-xl whitespace-nowrap"
          style={{ contain: 'layout paint' }}
        >
          Smart Debt Flow
        </span>
      )}
    </>
  );
});

LogoContent.displayName = 'LogoContent';

export function Logo({ className = '', showText = true, size = 'md', isLink = true }: LogoProps) {
  if (isLink) {
    return (
      <Link 
        to="/" 
        className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}
        style={{ contain: 'layout paint' }}
      >
        <LogoContent showText={showText} size={size} />
      </Link>
    );
  }

  return (
    <div 
      className={`flex items-center gap-3 ${className}`}
      style={{ contain: 'layout paint' }}
    >
      <LogoContent showText={showText} size={size} />
    </div>
  );
}