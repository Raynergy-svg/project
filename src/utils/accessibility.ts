import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Interface for keyboard shortcut configuration
 */
interface KeyboardShortcut {
  key: string;          // Key code (e.g., 'a', 'Enter', 'Escape')
  ctrlKey?: boolean;    // Whether Ctrl key should be pressed
  altKey?: boolean;     // Whether Alt key should be pressed
  shiftKey?: boolean;   // Whether Shift key should be pressed
  metaKey?: boolean;    // Whether Meta key (Command on Mac) should be pressed
  handler: (event: KeyboardEvent) => void;  // Handler to call when shortcut is triggered
  preventDefault?: boolean;   // Whether to prevent default action
  description?: string; // Description for help UI
}

/**
 * Hook to register keyboard shortcuts
 * 
 * @param shortcuts Array of keyboard shortcuts
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
): void {
  // Use a ref to avoid reattaching the event listener on shortcuts array change
  const shortcutsRef = useRef(shortcuts);
  
  // Update the shortcuts ref when the shortcuts array changes
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    shortcutsRef.current.forEach(shortcut => {
      const keyMatches = e.key === shortcut.key;
      const ctrlMatches = shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey;
      const altMatches = shortcut.altKey === undefined || e.altKey === shortcut.altKey;
      const shiftMatches = shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey;
      const metaMatches = shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey;
      
      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler(e);
      }
    });
  }, [enabled]);
  
  // Attach and detach the event listener
  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Generates an accessibility-friendly ID string
 * 
 * @param prefix Prefix for the ID
 * @returns A unique ID
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook to manage focus trapping within a container
 * 
 * @param active Whether focus trapping is active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(active: boolean = true) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Save the previously focused element
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    
    return () => {
      // Restore focus when component unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);
  
  // Handle tab key to trap focus
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      
      // Find all focusable elements in the container
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // Handle Tab and Shift+Tab to cycle within the container
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    // Focus the first focusable element when activated
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Add event listener for tab key
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);
  
  return containerRef;
}

/**
 * Hook to announce messages to screen readers using ARIA live regions
 * 
 * @returns Functions to announce messages
 */
export function useAnnounce() {
  // Create a ref to store the announcer element
  const announcerRef = useRef<HTMLDivElement | null>(null);
  
  // Create the announcer element on mount
  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }
    
    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);
  
  // Function to announce messages with different politeness levels
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;
    
    // Update the aria-live attribute
    announcerRef.current.setAttribute('aria-live', politeness);
    
    // Set the message (clearing it first to ensure announcement even if the same message is announced twice in a row)
    announcerRef.current.textContent = '';
    
    // Use setTimeout to ensure the DOM update happens in separate ticks
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 50);
  }, []);
  
  // Announce a message politely (for non-urgent updates)
  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);
  
  // Announce a message assertively (for urgent updates)
  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);
  
  return {
    announce,
    announcePolite,
    announceAssertive
  };
}

/**
 * Hook to detect screen reader usage
 * 
 * @returns Whether a screen reader is potentially in use
 */
export function useScreenReaderDetection() {
  const [possiblyUsingScreenReader, setPossiblyUsingScreenReader] = useState(false);
  
  useEffect(() => {
    // Check for potential screen reader usage
    const checkForScreenReader = () => {
      // Check for macOS VoiceOver
      const usingVoiceOver = 
        window.navigator.userAgent.includes('Mac') && 
        document.documentElement.style.getPropertyValue('cursor') === 'default';
      
      // Check for Windows Narrator or NVDA (approximate detection)
      const accessibilitySettingsEnabled = 
        document.querySelectorAll('[aria-hidden="false"]').length > 0 ||
        document.activeElement?.hasAttribute('aria-selected');
      
      // Check if user has specified accessibility preference
      const prefersReducedMotion = 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setPossiblyUsingScreenReader(
        usingVoiceOver || 
        accessibilitySettingsEnabled || 
        prefersReducedMotion
      );
    };
    
    checkForScreenReader();
    
    // Monitor for changes that might indicate screen reader usage
    const observer = new MutationObserver(() => {
      checkForScreenReader();
    });
    
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['aria-*', 'role']
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return possiblyUsingScreenReader;
}

/**
 * Add accessibility attributes to an element
 * 
 * @param props Props to spread onto the element
 * @returns Accessibility-enhanced props
 */
export function accessibilityProps(props: Record<string, any> = {}) {
  const {
    label,
    description,
    hasPopup,
    expanded,
    controls,
    labelledBy,
    describedBy,
    ...rest
  } = props;
  
  const a11yProps: Record<string, any> = { ...rest };
  
  if (label) {
    a11yProps['aria-label'] = label;
  }
  
  if (description) {
    a11yProps['aria-description'] = description;
  }
  
  if (hasPopup) {
    a11yProps['aria-haspopup'] = true;
  }
  
  if (expanded !== undefined) {
    a11yProps['aria-expanded'] = expanded;
  }
  
  if (controls) {
    a11yProps['aria-controls'] = controls;
  }
  
  if (labelledBy) {
    a11yProps['aria-labelledby'] = labelledBy;
  }
  
  if (describedBy) {
    a11yProps['aria-describedby'] = describedBy;
  }
  
  return a11yProps;
} 