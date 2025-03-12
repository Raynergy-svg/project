import { useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  deviceInfo?: {
    type: string;
    orientation: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

/**
 * Hook for tracking user interactions and analytics events.
 * Provides methods to track page views, interactions, and custom events.
 * 
 * @returns Object containing tracking methods
 */
export function useAnalytics() {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Add device and viewport information
      const enrichedEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        deviceInfo: {
          ...event.deviceInfo,
          userAgent: navigator.userAgent,
          language: navigator.language,
          // @ts-ignore
          connection: navigator.connection?.effectiveType
        }
      };

      // Store in Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert([enrichedEvent]);

      if (error) throw error;

      // Log in development
      if (import.meta.env.DEV) {
        console.log('Analytics Event:', enrichedEvent);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
      
      // Store failed events for retry
      const failedEvents = JSON.parse(
        localStorage.getItem('failedAnalyticsEvents') || '[]'
      );
      failedEvents.push({ event, timestamp: Date.now() });
      localStorage.setItem(
        'failedAnalyticsEvents',
        JSON.stringify(failedEvents)
      );
    }
  }, []);

  const trackPageView = useCallback((properties?: Record<string, any>) => {
    return trackEvent({
      name: 'page_view',
      properties: {
        path: window.location.pathname,
        title: document.title,
        ...properties
      }
    });
  }, [trackEvent]);

  const trackInteraction = useCallback((
    element: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    return trackEvent({
      name: 'interaction',
      properties: {
        element,
        action,
        ...properties
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackInteraction
  };
}