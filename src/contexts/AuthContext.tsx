import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from '@supabase/supabase-js';
import { supabase, handleAuthError } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    metadata?: { [key: string]: any };
  }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const errorMessage = handleAuthError(error);
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      if (data?.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "default",
        });
        navigate("/dashboard");
      }
      
      return { error: null };
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ 
    email, 
    password, 
    metadata 
  }: { 
    email: string; 
    password: string; 
    metadata?: { [key: string]: any }; 
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      // Check if email confirmation is required
      if (data?.user && data.user.identities?.length === 0) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
        return { error: new Error("Email already registered") };
      }

      return { error: null };
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
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
