import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2' | '2:1' | 'auto';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component that provides consistent styling,
 * fallback image support, aspect ratio control, and rounded corners.
 * 
 * @example
 * <OptimizedImage 
 *   src="/images/product.jpg"
 *   alt="Product"
 *   aspectRatio="4:3"
 *   rounded="md"
 *   className="hover:opacity-90"
 * />
 */
export function OptimizedImage({
  src,
  fallbackSrc = '/assets/image-placeholder.jpg',
  aspectRatio = 'auto',
  rounded = 'none',
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(src);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Handle image load errors
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // Handle image load complete
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '3:2':
        return 'aspect-[3/2]';
      case '2:1':
        return 'aspect-[2/1]';
      case 'auto':
      default:
        return '';
    }
  };

  // Generate rounded corner class
  const getRoundedClass = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        getAspectRatioClass(),
        getRoundedClass(),
        isLoading && 'animate-pulse bg-muted',
        className
      )}
    >
      <Image
        src={imgSrc}
        alt={alt || 'Image'}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'object-cover transition-opacity',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        fill={props.width === undefined && props.height === undefined}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage; 