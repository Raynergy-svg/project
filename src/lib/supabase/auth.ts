import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create a Supabase client for server components
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { path: string; domain?: string }) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
};

// Get the current user from the server
export const getServerUser = async () => {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error in getServerUser:', error);
    return null;
  }
};

// Get the current session from the server
export const getServerSession = async () => {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Error in getServerSession:', error);
    return null;
  }
};

// Check if the user is authenticated on the server
export const isAuthenticated = async () => {
  const session = await getServerSession();
  return !!session;
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}; 