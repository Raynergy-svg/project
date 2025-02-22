import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeSecurity } from '@/lib/security';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type SecurityContextType = ReturnType<typeof initializeSecurity>;

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

// Headers that can be set via meta tags
const META_COMPATIBLE_HEADERS = new Set([
  'Content-Security-Policy',
  'Content-Type',
  'Default-Style',
  'Refresh'
]);

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const [security, setSecurity] = useState<SecurityContextType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const securityInstance = initializeSecurity();
        
        // Wait for the encryption key to be initialized
        await securityInstance.sensitiveDataHandler.initializeKey();
        
        // Apply client-side security headers via meta tags
        if (typeof window !== 'undefined' && securityInstance.securityConfig.headers.clientSide) {
          Object.entries(securityInstance.securityConfig.headers.clientSide).forEach(([key, value]) => {
            // Check if meta tag already exists
            const existingMeta = document.head.querySelector(`meta[http-equiv="${key}"]`);
            if (existingMeta) {
              // Update existing meta tag
              existingMeta.setAttribute('content', value);
            } else {
              // Create new meta tag
              const meta = document.createElement('meta');
              meta.httpEquiv = key;
              meta.content = value;
              document.head.appendChild(meta);
            }
          });
        }

        setSecurity(securityInstance);
        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize security';
        console.error('Security initialization error:', error);
        setError(errorMessage);
        setIsInitialized(true); // Set to true so we can show error state
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Security initialization failed</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!security) {
    return null;
  }

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
}; 