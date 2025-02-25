import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function Image({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(
    placeholder === 'blur' ? blurDataURL : src
  );
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!priority && !isLoading) return;

    if (imageRef.current?.complete) {
      handleLoad();
    }
  }, [priority, isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setCurrentSrc(src);
    if (onLoad) onLoad();
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!width) return undefined;

    const sizes = [0.5, 1, 1.5, 2];
    return sizes
      .map((size) => {
        const w = Math.round(width * size);
        return `${src}?w=${w}&q=75 ${w}w`;
      })
      .join(', ');
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-muted/10',
        className
      )}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
    >
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        srcSet={generateSrcSet()}
        sizes={width ? `${width}px` : undefined}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}

// Helper function to generate blur data URL
export function generateBlurDataURL(width: number, height: number): string {
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)'/%3E%3C/svg%3E`;
} 