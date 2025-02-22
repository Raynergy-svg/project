import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLink?: boolean;
}

export function Logo({ className = '', showText = true, size = 'md', isLink = true }: LogoProps) {
  const sizeClasses = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100'
  };

  const heights = [30, 45, 35, 55];
  const baseWidth = 12;

  const content = (
    <>
      <div className={`relative h-[50px] w-[70px] ${sizeClasses[size]}`}>
        <div className="absolute inset-0 flex items-end justify-start gap-[4px] pb-1">
          {heights.map((height, index) => (
            <div 
              key={index} 
              className="relative" 
              style={{ 
                height: `${height}px`, 
                width: `${baseWidth}px`,
                transform: 'perspective(500px) rotateX(-10deg)'
              }}
            >
              {/* Front face */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#88B04B] to-[#6A9A2D]"
                style={{
                  transformOrigin: 'bottom',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
              />
              
              {/* Right side */}
              <div 
                className="absolute top-0 right-[-3px] w-[3px] h-full bg-[#4A7A2A]"
                style={{ 
                  transform: 'skewY(-45deg)',
                  transformOrigin: 'left',
                }}
              />
              
              {/* Top face */}
              <div 
                className="absolute top-[-3px] left-0 right-0 h-[3px] bg-[#A8D06B]"
                style={{ 
                  transform: 'skewX(-45deg)',
                  transformOrigin: 'bottom',
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {showText && (
        <span className="font-bold text-[#88B04B] font-['Poppins'] text-xl whitespace-nowrap">
          Smart Debt Flow
        </span>
      )}
    </>
  );

  if (isLink) {
    return (
      <Link to="/" className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {content}
    </div>
  );
}