import { useEffect, useRef, useCallback } from 'react';

interface CacheOptions {
  maxAge?: number; // Cache duration in milliseconds
  revalidate?: boolean; // Whether to revalidate cache in background
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function usePrefetch() {
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    return () => {
      // Cleanup any pending requests on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const prefetch = useCallback(async <T>(
    url: string,
    options: CacheOptions = {}
  ): Promise<T> => {
    const {
      maxAge = 5 * 60 * 1000, // 5 minutes default
      revalidate = true
    } = options;

    // Check cache first
    const cached = cache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < maxAge) {
      if (revalidate) {
        // Revalidate in background
        prefetchInBackground(url);
      }
      return cached.data as T;
    }

    // If not in cache or expired, fetch fresh data
    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'max-age=300' // 5 minutes browser cache
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update cache
      cache.set(url, {
        data,
        timestamp: now
      });

      return data as T;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      }
      throw error;
    }
  }, []);

  const prefetchInBackground = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Purpose': 'prefetch'
        },
        priority: 'low'
      });

      if (!response.ok) return;

      const data = await response.json();
      cache.set(url, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Background prefetch failed:', error);
    }
  };

  const prefetchImage = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
  }, []);

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  return { prefetch, prefetchImage, clearCache };
} 