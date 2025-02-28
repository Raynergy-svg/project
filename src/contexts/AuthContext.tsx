import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, SignUpData } from "@/types";

export interface User {
  id: string;
  name?: string;
  email: string;
  emailIv?: string;
  nameIv?: string;
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
  login: (data: User) => Promise<void>;
  logout: () => void;
  signup: (data: SignUpData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | undefined;
  subscriptionEndDate: Date | undefined;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Convert date string back to Date object if it exists
          if (userData.subscription?.currentPeriodEnd) {
            userData.subscription.currentPeriodEnd = new Date(userData.subscription.currentPeriodEnd);
          }
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Computed properties for subscription status
  const isAuthenticated = !!user;
  const isSubscribed = !!user?.subscription?.status && user.subscription.status === 'active';
  const subscriptionStatus = user?.subscription?.status || 'free';
  const subscriptionPlan = user?.subscription?.planName;
  const subscriptionEndDate = user?.subscription?.currentPeriodEnd;

  const login = async (data: User) => {
    // Save user to state and localStorage
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate("/");
  };

  const signup = async (data: SignUpData) => {
    // Create a proper User object from SignUpData
    const newUser: User = {
      id: crypto.randomUUID(), // Generate a temporary ID
      email: data.email,
      name: data.name,
      isPremium: !!data.subscriptionId, // Set premium based on subscription
      trialEndsAt: data.subscriptionId ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial if no subscription
      createdAt: new Date().toISOString(),
      subscription: data.subscriptionId ? {
        status: 'active',
        planName: 'Premium',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      } : {
        status: 'trialing',
        planName: 'Basic',
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      }
    };

    // Save user to state and localStorage
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    navigate("/dashboard");
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        signup, 
        isLoading,
        isAuthenticated,
        isSubscribed,
        subscriptionStatus,
        subscriptionPlan,
        subscriptionEndDate,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
