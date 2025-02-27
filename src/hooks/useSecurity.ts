import { useEffect, useState } from 'react';
import { MockSensitiveDataHandler } from '../lib/security/mockSensitiveDataHandler';

/**
 * A simplified hook that provides access to the mock sensitive data handler without requiring
 * the SecurityContext. This maintains the same interface for components that depend on useSecurity.
 */
export function useSecurity() {
  const [isInitialized, setIsInitialized] = useState(false);
  const sensitiveDataHandler = MockSensitiveDataHandler.getInstance();

  useEffect(() => {
    // Initialize the handler on mount
    if (!isInitialized) {
      sensitiveDataHandler.initializeKey()
        .then(() => setIsInitialized(true))
        .catch(err => console.error('Failed to initialize security:', err));
    }
  }, [isInitialized]);

  return {
    sensitiveDataHandler,
    isInitialized
  };
} 