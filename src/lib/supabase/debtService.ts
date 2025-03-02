import { supabase } from '@/utils/supabase/client';
import { checkSupabaseConnection as baseConnectionCheck } from '@/lib/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

// Define types for our debt data
export interface Debt {
  id?: string;
  user_id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'medical' | 'other';
  amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string | null;
  notes?: string | null;
  priority?: number | null;
  created_at?: string;
  updated_at?: string;
  // New fields for bank integration
  institution_id?: string | null;
  account_id?: string | null;
  plaid_item_id?: string | null;
  last_updated_from_bank?: string | null;
}

// Standard response type for our operations
export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Utility function to check if Supabase connection is working
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Use the base connection check function from client.ts
    return await baseConnectionCheck();
  } catch (error) {
    console.error('Supabase connection check failed with exception:', error);
    return false;
  }
}

/**
 * Fetch all debts for a specific user
 */
export async function fetchUserDebts(userId: string): Promise<ServiceResponse<Debt[]>> {
  try {
    if (!userId) {
      console.warn('fetchUserDebts called with empty userId');
      return { data: [], error: new Error('User ID is required') };
    }

    console.log(`Fetching debts for user: ${userId}`);
    
    // Check connection first
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Cannot fetch debts: Supabase connection is not available');
      return { 
        data: [], 
        error: new Error('Database connection is not available. Please check your internet connection and try again.')
      };
    }
    
    // Attempt to query the debts table
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Check explicitly for "table does not exist" error 
    if (error) {
      console.error('Supabase error fetching debts:', error);
      
      // PostgreSQL error code for undefined table is 42P01
      if (error.code === '42P01' || 
          (error.message && error.message.includes('does not exist')) ||
          (error.details && error.details.includes('does not exist'))) {
        return {
          data: [],
          error: new Error('The debts table does not exist in the database. Database setup is required.')
        };
      }
      
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} debts`);
    return { data: data || [], error: null };
  } catch (error) {
    // Special handling for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error when fetching debts:', error);
      return {
        data: [],
        error: new Error('Network connection error. Please check your internet connection and try again.')
      };
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    console.error('Error fetching debts:', errorMessage, error);
    
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(`Unknown error occurred: ${JSON.stringify(error)}`) 
    };
  }
}

/**
 * Fetch a single debt by ID
 */
export async function fetchDebtById(debtId: string): Promise<ServiceResponse<Debt>> {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching debt:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Create a new debt
 */
export async function createDebt(debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Debt>> {
  try {
    const { data, error } = await supabase
      .from('debts')
      .insert(debt)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating debt:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Update an existing debt
 */
export async function updateDebt(debtId: string, updates: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at'>>): Promise<ServiceResponse<Debt>> {
  try {
    // Add updated_at timestamp
    const updatedDebt = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('debts')
      .update(updatedDebt)
      .eq('id', debtId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating debt:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Delete a debt
 */
export async function deleteDebt(debtId: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId);

    if (error) {
      throw error;
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error deleting debt:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Get total debt amount for a user
 */
export async function getUserDebtSummary(userId: string): Promise<ServiceResponse<{
  total_amount: number;
  highest_interest_rate: number;
  total_minimum_payment: number;
  debt_count: number;
}>> {
  try {
    if (!userId) {
      console.warn('getUserDebtSummary called with empty userId');
      return { 
        data: {
          total_amount: 0,
          highest_interest_rate: 0,
          total_minimum_payment: 0,
          debt_count: 0
        }, 
        error: null 
      };
    }

    console.log(`Fetching debt summary for user: ${userId}`);
    
    // Check connection first
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Cannot fetch debt summary: Supabase connection is not available');
      return { 
        data: {
          total_amount: 0,
          highest_interest_rate: 0,
          total_minimum_payment: 0,
          debt_count: 0
        }, 
        error: new Error('Database connection is not available. Please check your internet connection and try again.')
      };
    }
    
    // Attempt to query the debts table
    const { data: debts, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId);

    // Check explicitly for "table does not exist" error
    if (error) {
      console.error('Supabase error getting debt summary:', error);
      
      // PostgreSQL error code for undefined table is 42P01
      if (error.code === '42P01' || 
          (error.message && error.message.includes('does not exist')) ||
          (error.details && error.details.includes('does not exist'))) {
        return {
          data: {
            total_amount: 0,
            highest_interest_rate: 0,
            total_minimum_payment: 0,
            debt_count: 0
          },
          error: new Error('The debts table does not exist in the database. Database setup is required.')
        };
      }
      
      throw error;
    }

    if (!debts || debts.length === 0) {
      console.log('No debts found for user, returning zero summary');
      return {
        data: {
          total_amount: 0,
          highest_interest_rate: 0,
          total_minimum_payment: 0,
          debt_count: 0
        },
        error: null
      };
    }

    const total_amount = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const highest_interest_rate = Math.max(...debts.map(debt => debt.interest_rate));
    const total_minimum_payment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    console.log('Successfully calculated debt summary');
    
    return {
      data: {
        total_amount,
        highest_interest_rate,
        total_minimum_payment,
        debt_count: debts.length
      },
      error: null
    };
  } catch (error) {
    // Special handling for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error when fetching debt summary:', error);
      return {
        data: {
          total_amount: 0,
          highest_interest_rate: 0,
          total_minimum_payment: 0,
          debt_count: 0
        },
        error: new Error('Network connection error. Please check your internet connection and try again.')
      };
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    console.error('Error getting debt summary:', errorMessage, error);
    
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(`Unknown error occurred: ${JSON.stringify(error)}`) 
    };
  }
} 