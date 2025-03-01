import { supabase } from '@/utils/supabase/client';
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
}

// Standard response type for our operations
export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Fetch all debts for a specific user
 */
export async function fetchUserDebts(userId: string): Promise<ServiceResponse<Debt[]>> {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching debts:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
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
    const { data: debts, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (!debts || debts.length === 0) {
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
    console.error('Error getting debt summary:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
} 