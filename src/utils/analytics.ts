/**
 * Analytics Utility for Next.js
 * 
 * This utility provides functions to track page views, events, and user
 * properties across the application, compatible with Next.js routing.
 */

// Define event types for type safety
export type AnalyticsEventName = 
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'button_click'
  | 'feature_used'
  | 'error'
  | 'conversion'
  | 'debt_added'
  | 'debt_updated'
  | 'payment_scheduled'
  | 'payment_completed'
  | 'milestone_achieved';

interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, any>;
}

interface UserProperties {
  userId?: string;
  email?: string;
  plan?: string;
  [key: string]: any;
}

interface PageViewProperties {
  path: string;
  title?: string;
  referrer?: string;
  search?: string;
}

// Initialize analytics - this would normally connect to your analytics provider
const initAnalytics = () => {
  // Only initialize in browser environment
  if (typeof window === 'undefined') return;

  try {
    // Example: initializing Google Analytics
    // if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    //   const script = document.createElement('script');
    //   script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
    //   script.async = true;
    //   document.head.appendChild(script);
    //
    //   window.dataLayer = window.dataLayer || [];
    //   function gtag(...args: any[]) {
    //     window.dataLayer.push(arguments);
    //   }
    //   gtag('js', new Date());
    //   gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    // }

    console.log('Analytics initialized');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

// Track page views
const trackPageView = (properties: PageViewProperties) => {
  if (typeof window === 'undefined') return;

  try {
    console.log('Page view tracked:', properties);
    
    // Example implementation:
    // gtag('event', 'page_view', {
    //   page_path: properties.path,
    //   page_title: properties.title,
    //   page_referrer: properties.referrer,
    // });
    
    // Or for a custom analytics implementation:
    // window.analytics?.page(properties.title, properties);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track custom events
const trackEvent = ({ name, properties = {} }: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;

  try {
    console.log('Event tracked:', name, properties);
    
    // Example implementation:
    // gtag('event', name, properties);
    
    // Or for a custom analytics implementation:
    // window.analytics?.track(name, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Identify user and set user properties
const identifyUser = (properties: UserProperties) => {
  if (typeof window === 'undefined' || !properties.userId) return;

  try {
    console.log('User identified:', properties.userId, properties);
    
    // Example implementation:
    // gtag('set', 'user_properties', properties);
    
    // Or for a custom analytics implementation:
    // window.analytics?.identify(properties.userId, properties);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};

// Reset user identification (on logout)
const resetUser = () => {
  if (typeof window === 'undefined') return;

  try {
    console.log('User reset');
    
    // Example implementation:
    // gtag('set', 'user_id', undefined);
    // gtag('set', 'user_properties', {});
    
    // Or for a custom analytics implementation:
    // window.analytics?.reset();
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
};

// Helper to create a Next.js analytics integration
const createNextAnalytics = () => {
  // Initialize analytics
  if (typeof window !== 'undefined') {
    initAnalytics();
  }

  return {
    // Next.js specific router integration
    // To be used in _app.tsx with router events
    onRouteChangeComplete: (url: string) => {
      trackPageView({
        path: url,
        title: document.title,
        referrer: document.referrer,
      });
    },

    // Standard analytics methods
    trackPageView,
    trackEvent,
    identifyUser,
    resetUser,
  };
};

// Expose the analytics instance
const analytics = createNextAnalytics();

export default analytics; 