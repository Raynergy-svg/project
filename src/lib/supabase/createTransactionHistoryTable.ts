import { supabase } from '@/utils/supabase/client';
import { DatabaseError } from '@/utils/errors';

/**
 * Creates the payment_transactions table in Supabase if it doesn't exist
 * This table tracks all payment transactions related to debt payments
 */
export async function createTransactionHistoryTable(): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Checking if payment_transactions table exists...');
    
    // Check if the table already exists by attempting to query it
    const { error: checkError } = await supabase
      .from('payment_transactions')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    // If there's no error, table exists
    if (!checkError) {
      console.log('Payment transactions table already exists');
      return { success: true, error: null };
    }
    
    // If the error is not the table-doesn't-exist error, something else is wrong
    if (checkError.code !== '42P01') {
      console.error('Unexpected error checking payment_transactions table:', checkError);
      throw new DatabaseError(checkError.message, 'check_table_exists', 'DB_QUERY_ERROR');
    }
    
    console.log('Payment transactions table does not exist');
    
    // Instead of trying to create the table, provide a message about manual setup
    console.info(
      'Transaction history table creation requires SQL execution privileges. ' + 
      'Please create tables using the Supabase dashboard SQL editor.'
    );
    
    return { 
      success: false, 
      error: 'Table creation requires SQL execution privileges. Please use the Supabase dashboard SQL editor to create necessary tables.' 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in createTransactionHistoryTable:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Adds a new payment transaction to the database
 */
export async function addPaymentTransaction(transactionData: {
  user_id: string;
  debt_id: string;
  amount: number;
  payment_date: Date;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  payment_method?: string;
  confirmation_code?: string;
  notes?: string;
}) {
  try {
    const { error } = await supabase
      .from('payment_transactions')
      .insert([transactionData]);
      
    if (error) {
      throw new DatabaseError(
        error.message, 
        'insert_payment_transaction', 
        error.code === '23505' ? 'DB_CONSTRAINT_VIOLATION' : 'DB_INSERT_ERROR'
      );
    }
    
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error adding payment transaction:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets payment transaction history for a specific debt
 */
export async function getDebtPaymentHistory(debtId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('debt_id', debtId)
      .order('payment_date', { ascending: false });
      
    if (error) {
      throw new DatabaseError(error.message, 'get_debt_payment_history', 'DB_QUERY_ERROR');
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting debt payment history:', errorMessage);
    return { success: false, data: null, error: errorMessage };
  }
}

/**
 * Gets all payment transactions for a user within a date range
 */
export async function getUserPaymentHistory(
  userId: string, 
  startDate?: Date, 
  endDate?: Date
) {
  try {
    let query = supabase
      .from('payment_transactions')
      .select(`
        *,
        debts(name, type, interest_rate)
      `)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
      
    // Add date filters if provided
    if (startDate) {
      query = query.gte('payment_date', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('payment_date', endDate.toISOString());
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw new DatabaseError(error.message, 'get_user_payment_history', 'DB_QUERY_ERROR');
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting user payment history:', errorMessage);
    return { success: false, data: null, error: errorMessage };
  }
} 