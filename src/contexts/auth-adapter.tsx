/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Use the consolidated auth system in src/contexts/AuthContext.tsx and src/utils/auth.ts instead.
 */
"use client";

/**
 * This file is a compatibility adapter to maintain backward compatibility
 * with components that still expect the original AuthContext.
 *
 * New code should import directly from src/contexts/AuthContext.tsx instead.
 */

import React from "react";
import {
  useAuth as useAuthOriginal,
  AuthProvider,
  UserProfile,
} from "./AuthContext";

// Re-export the useAuth hook for backward compatibility
export { useAuth } from "./AuthContext";

// Define the shape of the original AuthContext to maintain compatibility
interface User {
  id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  subscription?: {
    status: "free" | "active" | "past_due" | "canceled" | "trialing";
    planName?: string;
    currentPeriodEnd: Date;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | undefined;
  subscriptionEndDate: Date | undefined;
  login: (
    email: string,
    password: string,
    options?: Record<string, any>
  ) => Promise<any>;
  logout: () => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

// Export the adapter that will adapt NextAuthContext to AuthContext
export function AuthAdapter({ children }: { children: React.ReactNode }) {
  // Use our consolidated auth context
  const auth = useAuthOriginal();

  // Extra properties needed by the legacy interface
  const subscriptionStatus = auth.user?.subscription?.status || "free";
  const subscriptionPlan = auth.user?.subscription?.planName;
  const subscriptionEndDate = auth.user?.subscription?.currentPeriodEnd;

  // Legacy functions
  const resendConfirmationEmail = async (email: string) => {
    console.warn(
      "resendConfirmationEmail is deprecated. Use the reset password flow instead."
    );
    return Promise.resolve();
  };

  const updateUser = (data: Partial<User>) => {
    console.warn(
      "updateUser through context is deprecated. Use the API or Supabase client directly."
    );
  };

  // Adapt the login function to match legacy signature
  const adaptedLogin = async (
    email: string,
    password: string,
    options?: Record<string, any>
  ) => {
    const result = await auth.login(email, password, options);
    return {
      success: result.success,
      error: result.error || null,
      user: result.success ? auth.user : null,
    };
  };

  // Adapt the signup function to match legacy signature
  const adaptedSignup = async (data: {
    email: string;
    password: string;
    name?: string;
  }) => {
    const result = await auth.signup(data.email, data.password, data.name);
    return {
      success: result.success,
      error: result.error || null,
      user: result.success ? auth.user : null,
    };
  };

  // Create the adapted context value
  const adaptedAuth: AuthContextType = {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isSubscribed: auth.isSubscribed,
    subscriptionStatus,
    subscriptionPlan,
    subscriptionEndDate,
    login: adaptedLogin,
    logout: auth.logout,
    signup: adaptedSignup,
    resendConfirmationEmail,
    updateUser,
  };

  return <AuthProvider>{children}</AuthProvider>;
}
