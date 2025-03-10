'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface InteractionEvent {
  type: string;
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

type InteractionEventHandler = (event: InteractionEvent) => void;

export function useInteractionTracking(onInteraction?: InteractionEventHandler) {
  const pathname = usePathname();
  const currentPath = pathname;
  const previousPathRef = useRef(currentPath);
  const interactionBuffer = useRef<InteractionEvent[]>([]);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track page navigation as an interaction
  useEffect(() => {
    if (previousPathRef.current !== currentPath) {
      trackInteraction('navigation', 'page', {
        from: previousPathRef.current,
        to: currentPath
      });
      
      previousPathRef.current = currentPath;
    }
  }, [currentPath]);
  
  // Setup and cleanup event listeners
  useEffect(() => {
    // Setup event listeners for common interactions
    const trackClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      
      if (interactiveElements.includes(target.tagName)) {
        let elementIdentifier = target.id || 
                               target.getAttribute('name') || 
                               target.getAttribute('data-testid') || 
                               target.className || 
                               target.tagName.toLowerCase();
                               
        trackInteraction('click', elementIdentifier);
      }
    };
    
    const trackFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const elementIdentifier = target.id || 
                                 target.getAttribute('name') || 
                                 target.getAttribute('data-testid') || 
                                 target.className;
                                 
        trackInteraction('focus', elementIdentifier || target.tagName.toLowerCase());
      }
    };
    
    // Add event listeners
    document.addEventListener('click', trackClick);
    document.addEventListener('focus', trackFocus, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('focus', trackFocus, true);
      
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
      
      // Flush any remaining events
      flushEvents();
    };
  }, []);
  
  // Function to track an interaction
  const trackInteraction = useCallback((type: string, target: string, metadata?: Record<string, any>) => {
    const event: InteractionEvent = {
      type,
      target,
      timestamp: Date.now(),
      metadata
    };
    
    // Add to buffer
    interactionBuffer.current.push(event);
    
    // Call the handler directly if provided
    if (onInteraction) {
      onInteraction(event);
    }
    
    // Set up debounced flush if not already set
    if (!bufferTimeoutRef.current) {
      bufferTimeoutRef.current = setTimeout(flushEvents, 5000); // Flush every 5 seconds
    }
  }, [onInteraction]);
  
  // Function to flush buffered events
  const flushEvents = useCallback(() => {
    if (interactionBuffer.current.length === 0) return;
    
    // Here you would typically send the events to an analytics service
    // For example:
    // analyticsService.trackEvents(interactionBuffer.current);
    
    // For development, we'll just log them
    if (process.env.NODE_ENV === 'development') {
      console.log('Interaction events:', interactionBuffer.current);
    }
    
    // Clear the buffer
    interactionBuffer.current = [];
    
    // Clear the timeout reference
    bufferTimeoutRef.current = null;
  }, []);
  
  return {
    trackInteraction,
    flushEvents
  };
}