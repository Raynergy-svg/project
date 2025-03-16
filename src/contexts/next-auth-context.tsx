/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Use the consolidated auth system in src/contexts/AuthContext.tsx and src/utils/auth.ts instead.
 */
/**
 * This file is now a compatibility layer that re-exports from AuthContext
 * New code should import directly from AuthContext.tsx
 *
 * This maintains backward compatibility while we migrate to the new auth system.
 */

"use client";

import { AuthProvider, useAuth, UserProfile } from "./AuthContext";
import { Session } from "@supabase/supabase-js";

// Export types for backward compatibility
interface NextAuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  login: (
    email: string,
    password: string,
    options?: any
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create a re-export with the same name as the original context
export const NextAuthContext = useAuth;

// Re-export the provider with a legacy name
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Re-export the hook with a legacy name
export function useNextAuth() {
  return useAuth();
}

// Export the UserProfile type
export type { UserProfile, NextAuthContextType };
