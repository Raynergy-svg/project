"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import {
  logSecurityEvent,
  SecurityEventType,
} from "../services/securityAuditService";
import { SensitiveDataHandler } from "@/lib/security/sensitiveData";

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
const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

// Default session timeout (2 hours in milliseconds)
const DEFAULT_SESSION_TIMEOUT = 120 * 60 * 1000;
const WARNING_BEFORE_TIMEOUT = 10 * 60 * 1000; // 10 minutes before timeout

// Hook to use Security Context - Define this at the top level, not inside another function
function useSecurity(): SecurityContextType {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
}

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [csrfToken, setCsrfToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("csrfToken");
      return storedToken ?? uuidv4();
    }
    return uuidv4();
  });

  const [lastActivity, setLastActivity] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const storedTime = sessionStorage.getItem("lastActivity");
      return storedTime ? parseInt(storedTime, 10) : Date.now();
    }
    return Date.now();
  });

  const [remainingSessionTime, setRemainingSessionTime] = useState<number>(
    DEFAULT_SESSION_TIMEOUT
  );
  const router = useRouter();

  // Get auth context using useAuth hook
  const auth = useAuth();

  // Initialize sensitiveDataHandler
  const [sensitiveDataHandler] = useState<SensitiveDataHandler>(() => {
    return SensitiveDataHandler.getInstance();
  });

  // Initialize the encryption key when the component mounts
  useEffect(() => {
    const initSensitiveData = async () => {
      if (auth.user?.id) {
        try {
          await sensitiveDataHandler.initializeKey();
          // Only log if we have a user ID
          if (auth.user?.id) {
            try {
              logSecurityEvent(SecurityEventType.ENCRYPTION_KEY_GENERATED, {
                userId: auth.user.id,
              });
            } catch (logError) {
              console.warn(
                "Failed to log encryption key generation:",
                logError
              );
            }
          }
        } catch (error) {
          console.error("Failed to initialize sensitive data handler:", error);
          // Log the error but don't throw - we don't want to break the app
          if (auth.user?.id) {
            try {
              logSecurityEvent(SecurityEventType.ENCRYPTION_KEY_ERROR, {
                userId: auth.user.id,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            } catch (logError) {
              console.warn("Failed to log encryption key error:", logError);
            }
          }
        }
      }
    };

    if (auth.isAuthenticated && auth.user?.id) {
      initSensitiveData();
    }
  }, [auth.isAuthenticated, auth.user?.id, sensitiveDataHandler]);

  // CSRF token management
  const regenerateCSRFToken = () => {
    const newToken = uuidv4();
    setCsrfToken(newToken);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("csrfToken", newToken);
    }
  };

  const validateCSRFToken = (token: string): boolean => {
    return token === csrfToken;
  };

  // Input sanitization
  const sanitizeInput = (input: string): string => {
    // Basic sanitization - replace with more comprehensive solution in production
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Min 8 characters, at least one uppercase, one lowercase, one number, one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Session timeout management
  const checkSessionTimeout = (): boolean => {
    if (!auth.isAuthenticated || !auth.user?.id) return false;

    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivity;

    if (timeElapsed >= DEFAULT_SESSION_TIMEOUT) {
      // If session has timed out
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("lastActivity");
        sessionStorage.removeItem("csrfToken");
      }

      // Log the timeout event
      if (auth.user?.id) {
        try {
          logSecurityEvent(SecurityEventType.SESSION_TIMEOUT, {
            userId: auth.user.id,
            timeElapsed,
          });
        } catch (error) {
          console.warn("Failed to log session timeout:", error);
        }
      }

      // Force logout
      auth.logout().then(() => {
        router.push("/signin?timeout=true");
      });

      return true;
    }

    // Calculate remaining time
    const remaining = DEFAULT_SESSION_TIMEOUT - timeElapsed;
    setRemainingSessionTime(remaining);

    // If approaching timeout, warn the user
    if (remaining <= WARNING_BEFORE_TIMEOUT) {
      // Here you would typically display a warning to the user
      // This could be handled by a separate state and UI component
      console.warn(
        `Session expiring in ${Math.round(remaining / 60000)} minutes`
      );
    }

    return false;
  };

  const resetSessionTimer = () => {
    const currentTime = Date.now();
    setLastActivity(currentTime);
    setRemainingSessionTime(DEFAULT_SESSION_TIMEOUT);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("lastActivity", currentTime.toString());
    }
  };

  // Set up listeners for user activity
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    // Check session timeout on mount and periodically
    const timeoutInterval = setInterval(() => {
      checkSessionTimeout();
    }, 60000); // Check every minute

    const handleUserActivity = () => {
      resetSessionTimer();
    };

    // Only setup these listeners on the client side
    if (typeof window !== "undefined") {
      // Attach event listeners for user activity
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);

      // Store initial values in sessionStorage
      sessionStorage.setItem("csrfToken", csrfToken);
      sessionStorage.setItem("lastActivity", lastActivity.toString());
    }

    // Clean up intervals and event listeners
    return () => {
      clearInterval(timeoutInterval);
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleUserActivity);
        window.removeEventListener("keydown", handleUserActivity);
        window.removeEventListener("click", handleUserActivity);
        window.removeEventListener("scroll", handleUserActivity);
      }
    };
  }, [auth.isAuthenticated]);

  const contextValue: SecurityContextType = {
    csrfToken,
    regenerateCSRFToken,
    validateCSRFToken,
    sanitizeInput,
    validateEmail,
    validatePassword,
    checkSessionTimeout,
    resetSessionTimer,
    remainingSessionTime,
    sensitiveDataHandler,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export { useSecurity };
