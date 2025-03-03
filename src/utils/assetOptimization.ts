/**
 * Utility for image and asset optimization
 */

/**
 * Generates srcset for responsive images
 * 
 * @param basePath Base path for the image
 * @param widths Array of widths for different image sizes
 * @param extension File extension (default: 'webp')
 * @returns A formatted srcset string
 */
export function generateSrcSet(
  basePath: string,
  widths: number[],
  extension: string = 'webp'
): string {
  // Sort widths to ensure proper ordering
  const sortedWidths = [...widths].sort((a, b) => a - b);
  
  return sortedWidths
    .map(width => {
      // Extract the base filename without extension
      const baseFilename = basePath.substring(0, basePath.lastIndexOf('.'));
      
      // Create the filename with the width
      const filename = `${baseFilename}-${width}.${extension}`;
      
      return `${filename} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * 
 * @param breakpoints Object containing breakpoint definitions
 * @returns A properly formatted sizes attribute
 */
export function generateSizes(
  breakpoints: Record<string, string> = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw'
  }
): string {
  // Default breakpoint values in pixels
  const defaultBreakpointValues = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  // Convert the breakpoints object to a sizes string
  return Object.entries(breakpoints)
    .map(([breakpoint, size], index, arr) => {
      // If it's the last entry, just return the size with no media query
      if (index === arr.length - 1) {
        return size;
      }
      
      // Get the next breakpoint key
      const nextBreakpoint = arr[index + 1][0];
      
      // Get the pixel value for the next breakpoint
      const nextBreakpointValue = defaultBreakpointValues[nextBreakpoint as keyof typeof defaultBreakpointValues];
      
      // If there's no pixel value for the next breakpoint, just return the size
      if (!nextBreakpointValue) {
        return size;
      }
      
      // Return the size with the media query
      return `(min-width: ${nextBreakpointValue}px) ${size}`;
    })
    .reverse() // Reverse to get the correct order for sizes attribute
    .join(', ');
}

/**
 * Interface for responsive image props
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  widths?: number[];
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackFormat?: 'jpg' | 'png';
  fallbackSrc?: string;
  onLoad?: () => void;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Calculate the aspect ratio from image dimensions
 * 
 * @param width Image width
 * @param height Image height
 * @returns Formatted aspect ratio (e.g., "16/9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Calculate the image dimensions from width and aspect ratio
 * 
 * @param width Image width
 * @param aspectRatio Aspect ratio (e.g., "16:9" or "16/9")
 * @returns Object with width and height
 */
export function calculateDimensions(
  width: number,
  aspectRatio: string
): { width: number; height: number } {
  // Normalize aspect ratio format
  const ratio = aspectRatio.replace(':', '/');
  const [w, h] = ratio.split('/').map(Number);
  
  const height = Math.round((width * h) / w);
  return { width, height };
}

/**
 * Get image dimensions asynchronously
 * 
 * @param src Image source URL
 * @returns Promise that resolves to width and height
 */
export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Check if the browser supports WebP format
 * 
 * @returns Promise that resolves to true if WebP is supported
 */
export function isWebPSupported(): Promise<boolean> {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = () => {
      const result = webP.width > 0 && webP.height > 0;
      resolve(result);
    };
    webP.onerror = () => {
      resolve(false);
    };
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Check if a CDN URL can be built using an image optimizer service
 * 
 * @param url Original image URL
 * @param width Desired width
 * @param format Desired format
 * @returns Optimized image URL or original if no optimizer is available
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  format: 'webp' | 'avif' | 'jpg' | 'png' = 'webp'
): string {
  // Check if URL is already an optimized URL
  if (url.includes('imageoptimizer') || url.includes('imagecdn')) {
    return url;
  }
  
  // Check if it's a relative URL
  if (url.startsWith('/')) {
    // It's a local image, so we can use our own optimized versions
    // Extract the base filename without extension
    const lastDotIndex = url.lastIndexOf('.');
    const baseFilename = lastDotIndex > 0 ? url.substring(0, lastDotIndex) : url;
    
    return `${baseFilename}-${width}.${format}`;
  }
  
  // Return original URL if we can't optimize it
  return url;
}

/**
 * A simple in-memory cache for images to reduce duplicate requests
 */
class ImageCache {
  private cache: Map<string, string> = new Map();
  private static instance: ImageCache;
  
  private constructor() {}
  
  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }
  
  public async getOptimizedUrl(
    url: string,
    width: number,
    format: 'webp' | 'avif' | 'jpg' | 'png' = 'webp'
  ): Promise<string> {
    const cacheKey = `${url}-${width}-${format}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const optimizedUrl = getOptimizedImageUrl(url, width, format);
    this.cache.set(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  }
  
  public clear(): void {
    this.cache.clear();
  }
}

// Export the singleton cache instance
export const imageCache = ImageCache.getInstance();

/**
 * Preload critical images
 * 
 * @param urls Array of image URLs to preload
 */
export function preloadCriticalImages(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Apply blur-up technique for progressive image loading
 * 
 * @param imageElement Image element reference
 * @param blurDataURL Base64 placeholder image
 * @param srcSet Full quality image srcSet
 * @param src Full quality image src
 */
export function applyBlurUpLoading(
  imageElement: HTMLImageElement,
  blurDataURL: string,
  srcSet: string,
  src: string
): void {
  // Start with the low-quality placeholder
  imageElement.src = blurDataURL;
  
  // Create a new image object to load the high-quality image in the background
  const highQualityImg = new Image();
  
  // When the high-quality image is loaded, swap it in
  highQualityImg.onload = () => {
    // Update the original image element with the high-quality image
    imageElement.src = src;
    imageElement.srcset = srcSet;
    imageElement.classList.add('loaded');
  };
  
  // Set up the high quality image load
  highQualityImg.srcset = srcSet;
  highQualityImg.src = src;
} 