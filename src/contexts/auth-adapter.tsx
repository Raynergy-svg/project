'use client';

import React, { createContext, useContext } from 'react';
import { useNextAuth } from './next-auth-context';

// Define the shape of the original AuthContext
// This should match your original AuthContext type
interface User {
  id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  subscription?: {
    status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing';
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
  login: (email: string, password: string, options?: Record<string, any>) => Promise<any>;
  logout: () => Promise<void>;
  signup: (data: { email: string; password: string; name?: string }) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

// Create a context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the provider that will adapt NextAuthContext to AuthContext
export function AuthAdapter({ children }: { children: React.ReactNode }) {
  // Use the Next.js auth context
  const nextAuth = useNextAuth();
  
  // Map NextAuth to the original AuthContext interface
  const adaptedAuth: AuthContextType = {
    user: nextAuth.user,
    isLoading: nextAuth.isLoading,
    isAuthenticated: nextAuth.isAuthenticated,
    isSubscribed: nextAuth.isSubscribed,
    subscriptionStatus: nextAuth.user?.subscription?.status || 'free',
    subscriptionPlan: nextAuth.user?.subscription?.planName,
    subscriptionEndDate: nextAuth.user?.subscription?.currentPeriodEnd,
    
    // Adapt the login function
    login: async (email, password) => {
      const result = await nextAuth.login(email, password);
      return { user: result.user, error: result.error };
    },
    
    // Adapt the logout function
    logout: nextAuth.logout,
    
    // Adapt the signup function
    signup: async (data) => {
      const result = await nextAuth.signup(data.email, data.password, data.name);
      return { 
        user: result.user, 
        error: result.error,
        needsEmailConfirmation: false // Set based on your requirements
      };
    },
    
    // Stub for resendConfirmationEmail
    resendConfirmationEmail: async (email) => {
      console.log('Resend confirmation email not implemented in adapter', email);
    },
    
    // Stub for updateUser - would need to implement this properly
    updateUser: (data) => {
      console.log('Update user not implemented in adapter', data);
    }
  };

  // Return the original AuthContext provider with our adapted values
  return (
    <AuthContext.Provider value={adaptedAuth}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the useAuth hook that will match the original interface
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 