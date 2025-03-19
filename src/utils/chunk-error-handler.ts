'use client';

/**
 * This utility provides protection against webpack chunk loading errors
 * by adding global error handlers and retry mechanisms.
 */

const CHUNK_ERROR_RETRY_COUNT = 3;
const CHUNK_ERROR_FLAG = '__CHUNK_ERROR_HANDLER_APPLIED';

export function applyChunkErrorHandler() {
  // Don't apply multiple times
  if ((window as any)[CHUNK_ERROR_FLAG]) {
    return;
  }

  (window as any)[CHUNK_ERROR_FLAG] = true;
  
  // Track failed chunks to avoid infinite retries
  (window as any).__failedChunks = new Set();

  // Retry loading failed chunks
  const retryLoadChunk = (url: string, maxRetries = CHUNK_ERROR_RETRY_COUNT) => {
    // Skip if we've already tried this chunk
    if ((window as any).__failedChunks.has(url)) {
      return;
    }
    
    let retries = 0;
    const loadScript = () => {
      if (retries >= maxRetries) {
        // Mark this chunk as failed after max retries
        (window as any).__failedChunks.add(url);
        
        // Dispatch custom event so error boundaries can catch it
        window.dispatchEvent(
          new CustomEvent('chunkLoadError', { 
            detail: { 
              url, 
              message: `Failed to load chunk after ${maxRetries} retries` 
            } 
          })
        );
        return;
      }

      retries++;
      
      // Create and append a new script tag
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        console.log(`Successfully loaded chunk after retry: ${url}`);
      };
      script.onerror = () => {
        console.warn(`Failed to load chunk (retry ${retries}/${maxRetries}): ${url}`);
        // Exponential backoff for retries
        setTimeout(loadScript, 500 * Math.pow(2, retries - 1));
      };
      document.head.appendChild(script);
    };

    loadScript();
  };

  // Handle window.onerror events for chunk loading
  const originalOnError = window.onerror;
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (typeof msg === 'string' && 
        (msg.includes('chunk') || msg.includes('Loading chunk')) && 
        typeof url === 'string' && 
        url.includes('/_next/')) {
      
      console.warn('Chunk load error detected, attempting recovery', { msg, url });
      retryLoadChunk(url);
      
      // Return true to prevent the error from bubbling up
      return true;
    }
    
    // Pass through to original handler
    if (typeof originalOnError === 'function') {
      return originalOnError(msg, url, lineNo, columnNo, error);
    }
    
    return false;
  };

  // Add capture phase event listener for script errors
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement) {
      const src = event.target.src;
      if (src.includes('/_next/')) {
        console.warn('Script load error detected, attempting recovery', { src });
        retryLoadChunk(src);
        event.preventDefault();
      }
    }
  }, true);

  console.log('🛡️ Chunk error handler applied');
}

export default applyChunkErrorHandler;
