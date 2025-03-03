import React, { useState, useEffect, useRef } from 'react';
import { 
  generateSrcSet, 
  generateSizes, 
  ResponsiveImageProps,
  isWebPSupported,
  imageCache
} from '@/utils/assetOptimization';
import { accessibilityProps } from '@/utils/accessibility';

interface OptimizedImageProps extends ResponsiveImageProps {
  aspectRatio?: string;
  lowQualityPlaceholder?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  blur?: boolean;
  ariaLabel?: string;
}

/**
 * An optimized image component that:
 * - Uses WebP or fallback format based on browser support
 * - Handles responsive images with srcset and sizes
 * - Implements blur-up loading technique (optional)
 * - Sets proper width and height attributes to prevent layout shifts
 * - Includes accessibility attributes
 * - Sets appropriate loading and fetchPriority attributes
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  widths = [640, 750, 828, 1080, 1200, 1920],
  sizes,
  className = '',
  loading = 'lazy',
  fallbackFormat = 'jpg',
  fallbackSrc,
  onLoad,
  fetchPriority = 'auto',
  aspectRatio,
  lowQualityPlaceholder,
  objectFit = 'cover',
  objectPosition = 'center',
  blur = false,
  ariaLabel
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(true); // Default to true, will check later
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [optimizedSrcSet, setOptimizedSrcSet] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Calculate default sizes if not provided
  const defaultSizes = sizes || generateSizes({
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw'
  });
  
  // Check WebP support on mount
  useEffect(() => {
    const checkWebPSupport = async () => {
      const webpSupported = await isWebPSupported();
      setSupportsWebP(webpSupported);
    };
    
    checkWebPSupport();
  }, []);
  
  // Get optimized URLs
  useEffect(() => {
    const getOptimizedUrls = async () => {
      try {
        // Select the appropriate format based on browser support
        const format = supportsWebP ? 'webp' : fallbackFormat;
        
        // Get optimized source for largest width
        const largestWidth = Math.max(...widths);
        const optimizedSource = await imageCache.getOptimizedUrl(src, largestWidth, format);
        setOptimizedSrc(optimizedSource);
        
        // Generate srcset with all widths
        const srcset = generateSrcSet(src, widths, format);
        setOptimizedSrcSet(srcset);
      } catch (error) {
        console.error('Failed to optimize image:', error);
        // Fallback to original source if optimization fails
        setOptimizedSrc(src);
      }
    };
    
    getOptimizedUrls();
  }, [src, widths, supportsWebP, fallbackFormat]);
  
  // Handle image loading
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };
  
  // Style for blur effect
  const blurStyle = blur && !isLoaded
    ? { filter: 'blur(20px)', transition: 'filter 0.3s ease-out' }
    : { filter: 'none', transition: 'filter 0.3s ease-out' };
  
  // Combine all classes
  const combinedClassName = `
    optimized-image
    ${blur ? 'blur-load' : ''}
    ${isLoaded ? 'loaded' : ''}
    ${className}
  `;
  
  return (
    <img
      ref={imgRef}
      src={optimizedSrc || src}
      srcSet={optimizedSrcSet}
      sizes={defaultSizes}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={combinedClassName}
      style={{
        objectFit,
        objectPosition,
        ...blurStyle,
        aspectRatio: aspectRatio
      }}
      onLoad={handleImageLoad}
      {...accessibilityProps({
        label: ariaLabel
      })}
    />
  );
};

export default OptimizedImage; 