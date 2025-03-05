import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { logSecurityEvent, SecurityEventType } from '../services/securityAuditService';
import { SensitiveDataHandler } from '@/lib/security/sensitiveData';

// Interface for SecurityContext
export interface SecurityContextType {
  csrfToken: string;
  regenerateCSRFToken: () => void;
  validateCSRFToken: (token: string) => boolean;
  sanitizeInput: (input: string) => string;
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => boolean;
  checkSessionTimeout: () => boolean;
  resetSessionTimer: () => void;
  remainingSessionTime: number;
  sensitiveDataHandler: SensitiveDataHandler;
}

// Create Security Context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Default session timeout (2 hours in milliseconds)
const DEFAULT_SESSION_TIMEOUT = 120 * 60 * 1000;
const WARNING_BEFORE_TIMEOUT = 10 * 60 * 1000; // 10 minutes before timeout

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState<string>(() => {
    const storedToken = sessionStorage.getItem('csrfToken');
    return storedToken ?? uuidv4();
  });
  
  const [lastActivity, setLastActivity] = useState<number>(() => {
    const storedTime = sessionStorage.getItem('lastActivity');
    return storedTime ? parseInt(storedTime, 10) : Date.now();
  });
  
  const [remainingSessionTime, setRemainingSessionTime] = useState<number>(DEFAULT_SESSION_TIMEOUT);
  const navigate = useNavigate();
  
  // Get auth context using useAuth hook
  const auth = useAuth();

  // Initialize sensitiveDataHandler
  const [sensitiveDataHandler] = useState<SensitiveDataHandler>(() => {
    return SensitiveDataHandler.getInstance();
  });
  
  // Initialize the encryption key when the component mounts
  useEffect(() => {
    const initSensitiveData = async () => {
      try {
        await sensitiveDataHandler.initializeKey();
        console.log('Sensitive data handler initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sensitive data handler:', error);
      }
    };
    
    initSensitiveData();
  }, [sensitiveDataHandler]);

  // Generate a new CSRF token
  const regenerateCSRFToken = () => {
    const newToken = uuidv4();
    sessionStorage.setItem('csrfToken', newToken);
    setCsrfToken(newToken);
  };

  // Validate a CSRF token
  const validateCSRFToken = (token: string): boolean => {
    return token === csrfToken;
  };

  // Sanitize user input to prevent injection attacks
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;');
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Check if the session has timed out
  const checkSessionTimeout = (): boolean => {
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivity;
    
    if (timeElapsed >= DEFAULT_SESSION_TIMEOUT) {
      // Log user out if session has timed out
      if (auth?.user) {
        // Try to log security event but don't block logout if it fails
        try {
          logSecurityEvent(
            SecurityEventType.SESSION_TIMEOUT, 
            { reason: 'Session timeout due to inactivity' }, 
            'low',
            auth.user.id
          ).catch(err => {
            // Just log and continue if there's an error with the security logging
            console.warn('Failed to log session timeout event:', err);
          });
        } catch (error) {
          // Catch any synchronous errors
          console.warn('Exception in session timeout logging:', error);
        }
        
        // Only attempt to logout if auth is initialized and has logout function
        if (auth.logout) {
          auth.logout().catch(err => {
            console.warn('Logout failed:', err);
            // Still try to navigate to login even if logout fails
            navigate('/login');
          });
        } else {
          // If no logout function, just navigate to login
          navigate('/login');
        }
      } else {
        // No authenticated user, just navigate to login
        navigate('/login');
      }
      return true;
    }
    
    // Calculate remaining time and set state
    const remaining = Math.max(0, DEFAULT_SESSION_TIMEOUT - timeElapsed);
    setRemainingSessionTime(remaining);
    
    // Show warning if close to timeout
    if (remaining <= WARNING_BEFORE_TIMEOUT && remaining > 0) {
      console.warn(`Session will expire in ${Math.ceil(remaining / 60000)} minutes`);
      // Could trigger a warning notification here
    }
    
    return false;
  };

  // Reset the session timer
  const resetSessionTimer = () => {
    const currentTime = Date.now();
    sessionStorage.setItem('lastActivity', currentTime.toString());
    setLastActivity(currentTime);
    setRemainingSessionTime(DEFAULT_SESSION_TIMEOUT);
  };

  // Initialize and store CSRF token
  useEffect(() => {
    if (!sessionStorage.getItem('csrfToken')) {
      regenerateCSRFToken();
    }
    
    // Set up session timeout check interval
    const intervalId = setInterval(() => {
      checkSessionTimeout();
    }, 60000); // Check every minute
    
    // Set up user activity listeners
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetSessionTimer();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Initial check
    resetSessionTimer();
    checkSessionTimeout();
    
    return () => {
      clearInterval(intervalId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  return (
    <SecurityContext.Provider value={{
      csrfToken,
      regenerateCSRFToken,
      validateCSRFToken,
      sanitizeInput,
      validateEmail,
      validatePassword,
      checkSessionTimeout,
      resetSessionTimer,
      remainingSessionTime,
      sensitiveDataHandler
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

// Hook to use Security Context
export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}; 