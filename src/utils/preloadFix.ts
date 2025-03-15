/**
 * Preload Fix Utility
 * 
 * This utility provides functions to fix preload warnings by ensuring
 * the correct 'as' attribute is set for preload links based on the resource type.
 */

// Map of file extensions to their corresponding 'as' attribute values
const extensionToAsAttributeMap: Record<string, string> = {
  // Images
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'svg': 'image',
  'webp': 'image',
  'avif': 'image',
  'ico': 'image',
  
  // Fonts
  'woff': 'font',
  'woff2': 'font',
  'ttf': 'font',
  'otf': 'font',
  'eot': 'font',
  
  // Scripts
  'js': 'script',
  'mjs': 'script',
  'jsx': 'script',
  'ts': 'script',
  'tsx': 'script',
  
  // Styles
  'css': 'style',
  
  // Documents
  'html': 'document',
  'pdf': 'document',
  
  // Audio
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  
  // Video
  'mp4': 'video',
  'webm': 'video',
  'ogv': 'video',
  
  // Data
  'json': 'fetch',
  'xml': 'fetch',
  
  // Other
  'txt': 'fetch',
  'csv': 'fetch'
};

/**
 * Get the appropriate 'as' attribute value for a given URL
 * @param url The URL of the resource
 * @returns The correct 'as' attribute value, or undefined if it can't be determined
 */
export function getAsAttributeForUrl(url: string): string | undefined {
  try {
    // Extract the file extension from the URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    
    if (!extension) return undefined;
    
    // Check if we have a mapping for this extension
    return extensionToAsAttributeMap[extension];
  } catch (e) {
    // If URL parsing fails, try a simpler approach
    const parts = url.split('.');
    if (parts.length > 1) {
      const extension = parts.pop()?.toLowerCase();
      if (extension) {
        return extensionToAsAttributeMap[extension];
      }
    }
    
    return undefined;
  }
}

/**
 * Fix preload warnings by setting the correct 'as' attribute on preload links
 * This function sets up a MutationObserver to monitor for new preload links
 * and fixes them as they are added to the DOM
 */
export function setupPreloadWarningFix(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  // First, fix any existing preload links
  fixExistingPreloadLinks();
  
  // Then set up an observer to fix new links as they're added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is a link element
          if (node.nodeName === 'LINK') {
            const linkElement = node as HTMLLinkElement;
            fixPreloadLink(linkElement);
          }
          
          // Also check for link elements within added nodes
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const links = element.querySelectorAll('link[rel="preload"]');
            links.forEach(fixPreloadLink);
          }
        });
      }
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true 
  });
  
  // Return a cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Fix all existing preload links in the document
 */
export function fixExistingPreloadLinks(): void {
  if (typeof document === 'undefined') return;
  
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  preloadLinks.forEach(fixPreloadLink);
}

/**
 * Fix a single preload link by setting the correct 'as' attribute
 * @param link The link element to fix
 */
export function fixPreloadLink(link: Element): void {
  if (!(link instanceof HTMLLinkElement)) return;
  
  // Only process preload links
  if (link.rel !== 'preload') return;
  
  // Skip if the link already has an 'as' attribute
  if (link.hasAttribute('as') && link.getAttribute('as') !== '') return;
  
  const href = link.href;
  if (!href) return;
  
  const asValue = getAsAttributeForUrl(href);
  if (asValue) {
    link.setAttribute('as', asValue);
    console.log(`🔧 Preload Fix: Set 'as=${asValue}' for ${href}`);
  }
}

/**
 * Create a properly configured preload link for a resource
 * @param href The URL of the resource to preload
 * @param options Additional options for the preload link
 * @returns An object with the link attributes
 */
export function createPreloadLink(href: string, options?: {
  as?: string;
  type?: string;
  crossOrigin?: string | boolean;
  media?: string;
}): React.ComponentProps<'link'> {
  const asValue = options?.as || getAsAttributeForUrl(href) || 'fetch';
  
  return {
    rel: 'preload',
    href,
    as: asValue,
    ...options,
    // Convert boolean crossOrigin to string if needed
    ...(options?.crossOrigin === true ? { crossOrigin: 'anonymous' } : {})
  };
}

export default setupPreloadWarningFix; 