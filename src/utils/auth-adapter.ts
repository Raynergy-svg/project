// This is a compatibility layer between your existing auth and Next.js

import { supabase } from '@/utils/supabase/client';

// Get the current session in a way that works with both client and server
export const getSession = async () => {
  // Make sure we're in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Get the current user
export const getUser = async () => {
  // Make sure we're in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Sign in with email/password - works with Next.js router
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out - works with Next.js router
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}; 