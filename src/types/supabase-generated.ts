/**
 * GENERATED TYPES FOR SUPABASE
 * 
 * This is a basic placeholder for Supabase generated types.
 * For a complete type definition, you should run:
 * 
 * ```
 * npx supabase gen types typescript --project-id your-project-id > src/types/supabase-generated.ts
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // Add other tables as needed
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