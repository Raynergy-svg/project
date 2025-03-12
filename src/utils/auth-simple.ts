import { createClient } from '@supabase/supabase-js';

// Create a simple Supabase client for authentication
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Alias for signIn to match the import in dev-auth page
export const signInWithPassword = async (email: string, password: string, options?: { captchaToken?: string }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: options?.captchaToken
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in with password:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const signUp = async (email: string, password: string, options?: { captchaToken?: string, userData?: any }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: options?.captchaToken,
        data: options?.userData
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// For testing purposes
export const isAuthenticated = async () => {
  const session = await getSession();
  return !!session;
};

// Development authentication function
export const devAuth = async (role: 'admin' | 'user') => {
  try {
    const email = role === 'admin' ? 'admin@example.com' : 'user@example.com';
    const password = 'password123';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error in dev auth:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 