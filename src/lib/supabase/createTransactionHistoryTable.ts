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
    
    console.log('Payment transactions table does not exist. Creating it now...');
    
    // Execute SQL to create the table (using RPC to execute SQL directly)
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.payment_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
          amount DECIMAL(15,2) NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status TEXT NOT NULL,
          payment_method TEXT,
          confirmation_code TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        -- Add indexes for better query performance
        CREATE INDEX IF NOT EXISTS payment_transactions_user_id_idx ON public.payment_transactions (user_id);
        CREATE INDEX IF NOT EXISTS payment_transactions_debt_id_idx ON public.payment_transactions (debt_id);
        CREATE INDEX IF NOT EXISTS payment_transactions_payment_date_idx ON public.payment_transactions (payment_date);
        CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON public.payment_transactions (status);
        
        -- Create RLS (Row Level Security) policies
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to see only their transactions
        CREATE POLICY select_own_transactions ON public.payment_transactions
          FOR SELECT USING (auth.uid() = user_id);
        
        -- Create policy to allow users to insert their own transactions
        CREATE POLICY insert_own_transactions ON public.payment_transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Create policy to allow users to update their own transactions
        CREATE POLICY update_own_transactions ON public.payment_transactions
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- Create policy to allow users to delete their own transactions
        CREATE POLICY delete_own_transactions ON public.payment_transactions
          FOR DELETE USING (auth.uid() = user_id);
          
        -- Create function to update the 'updated_at' timestamp
        CREATE OR REPLACE FUNCTION update_payment_transaction_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger to automatically update the timestamp
        CREATE TRIGGER update_payment_transaction_timestamp
        BEFORE UPDATE ON public.payment_transactions
        FOR EACH ROW
        EXECUTE FUNCTION update_payment_transaction_timestamp();
      `
    });
    
    if (createError) {
      console.error('Error creating payment_transactions table:', createError);
      throw new DatabaseError(createError.message, 'create_table', 'DB_QUERY_ERROR');
    }
    
    console.log('Successfully created payment_transactions table');
    return { success: true, error: null };
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