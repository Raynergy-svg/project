import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface InteractionEvent {
  type: string;
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export function useInteractionTracking() {
  const location = useLocation();
  const interactionQueue = useRef<InteractionEvent[]>([]);
  const isProcessing = useRef(false);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || interactionQueue.current.length === 0) return;

    isProcessing.current = true;
    const events = [...interactionQueue.current];
    interactionQueue.current = [];

    try {
      // Here you would typically send to your analytics service
      console.log('Interaction events:', events);
      
      // Example implementation for sending to an API
      // await fetch('/api/analytics/interactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(events)
      // });
    } catch (error) {
      console.error('Failed to process interaction events:', error);
      // Re-queue failed events
      interactionQueue.current = [...events, ...interactionQueue.current];
    }

    isProcessing.current = false;
    if (interactionQueue.current.length > 0) {
      processQueue();
    }
  }, []);

  const trackInteraction = useCallback((
    type: string,
    target: string,
    metadata?: Record<string, any>
  ) => {
    const event: InteractionEvent = {
      type,
      target,
      timestamp: Date.now(),
      metadata
    };

    interactionQueue.current.push(event);
    processQueue();
  }, [processQueue]);

  useEffect(() => {
    // Track page views
    trackInteraction('pageview', location.pathname, {
      path: location.pathname,
      search: location.search
    });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      const link = target.closest('a');

      if (button) {
        trackInteraction('click', 'button', {
          text: button.textContent?.trim(),
          id: button.id,
          className: button.className
        });
      } else if (link) {
        trackInteraction('click', 'link', {
          href: link.href,
          text: link.textContent?.trim()
        });
      }
    };

    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );

      if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackInteraction('scroll_depth', String(scrollDepth), {
          path: location.pathname
        });
      }
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location, trackInteraction]); // Added missing dependency

  return { trackInteraction };
}