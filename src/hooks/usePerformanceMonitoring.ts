import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  domContentLoaded?: number;
  resourceLoadTimes: {
    name: string;
    duration: number;
    type: string;
  }[];
}

interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics;
  isSupported: boolean;
}

export function usePerformanceMonitoring(): UsePerformanceMonitoringReturn {
  const metricsRef = useRef<PerformanceMetrics>({
    timeToFirstByte: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    resourceLoadTimes: []
  });

  const isSupported = typeof window !== 'undefined' && 'PerformanceObserver' in window;

  const sendMetricsToAnalytics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    try {
      // Here you would typically send to your analytics service
      console.log('Performance Metrics:', metrics);
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      
      // Store failed metrics in localStorage for retry
      const failedMetrics = JSON.parse(
        localStorage.getItem('failedPerformanceMetrics') || '[]'
      );
      failedMetrics.push({ metrics, timestamp: Date.now() });
      localStorage.setItem(
        'failedPerformanceMetrics', 
        JSON.stringify(failedMetrics)
      );
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metricsRef.current.timeToFirstByte = navigationEntry.responseStart - navigationEntry.requestStart;
      metricsRef.current.domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
    }

    // Resource Timing
    const resourceEntries = performance.getEntriesByType('resource');
    metricsRef.current.resourceLoadTimes = resourceEntries.map(entry => ({
      name: entry.name,
      duration: entry.duration,
      type: entry.initiatorType
    }));

    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metricsRef.current.firstContentfulPaint = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      metricsRef.current.largestContentfulPaint = lastEntry.startTime;
      
      sendMetricsToAnalytics(metricsRef.current);
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0];
      if (firstInput) {
        metricsRef.current.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        
        sendMetricsToAnalytics(metricsRef.current);
      }
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let cumulativeLayoutShift = 0;
      
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value;
        }
      }
      
      metricsRef.current.cumulativeLayoutShift = cumulativeLayoutShift;
      
      sendMetricsToAnalytics(metricsRef.current);
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Some performance metrics are not supported:', error);
    }

    // Cleanup observers
    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [isSupported, sendMetricsToAnalytics]);

  return {
    metrics: metricsRef.current,
    isSupported
  };
}