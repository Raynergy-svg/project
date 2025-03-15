/**
 * Supabase Types
 * 
 * This file provides centralized type definitions for Supabase.
 * It includes both generated database types and custom type definitions.
 * 
 * NOTE: For database types, you can use the Supabase CLI to generate types:
 * ```
 * npx supabase gen types typescript --project-id your-project-id > src/types/supabase-generated.ts
 * ```
 */

// Define Database type inline instead of importing
// import { Database as GeneratedDatabase } from './supabase-generated.js';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';

// Define the JSON type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the Database type inline
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          avatar_url?: string
          is_subscribed?: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          avatar_url?: string
          is_subscribed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          avatar_url?: string
          is_subscribed?: boolean
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          plan_id?: string
          current_period_end?: string
          cancel_at?: string
          canceled_at?: string
          trial_end?: string
          trial_start?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id: string
          user_id: string
          status: string
          plan_id?: string
          current_period_end?: string
          cancel_at?: string
          canceled_at?: string
          trial_end?: string
          trial_start?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          plan_id?: string
          current_period_end?: string
          cancel_at?: string
          canceled_at?: string
          trial_end?: string
          trial_start?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Common response type for service functions
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  is_subscribed?: boolean;
  subscription?: SubscriptionDetails;
}

// Subscription details type
export interface SubscriptionDetails {
  id: string;
  status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  current_period_end: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_end?: string;
  trial_start?: string;
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

// Auth context type
export interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Export Supabase-related types from the official package
export type { User, Session, SupabaseClient };

// Database table types - these match the tables in your Supabase database
export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Subscription = Tables['subscriptions']['Row']; 