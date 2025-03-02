import { supabase } from '@/utils/supabase/client';

/**
 * Creates the bank_accounts table in Supabase if it doesn't exist
 * This should be run once when the application first initializes
 */
export async function createBankAccountsTable(): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Checking if bank_accounts table exists...');
    
    // Check if the table already exists by attempting to query it
    const { error: checkError } = await supabase
      .from('bank_accounts')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    // If there's no error, table exists
    if (!checkError) {
      console.log('Bank accounts table already exists');
      return { success: true, error: null };
    }
    
    // If the error is not the table-doesn't-exist error, something else is wrong
    if (checkError.code !== '42P01') {
      console.error('Unexpected error checking bank_accounts table:', checkError);
      return { success: false, error: checkError.message };
    }
    
    console.log('Bank accounts table does not exist. Creating it now...');
    
    // Execute SQL to create the table (using RPC to execute SQL directly)
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.bank_accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance DECIMAL(15,2) NOT NULL,
          institution TEXT NOT NULL,
          account_number TEXT,
          plaid_item_id TEXT,
          plaid_account_id TEXT,
          institution_id TEXT,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          metadata JSONB
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts (user_id);
        
        -- Enable RLS
        ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY select_own_accounts ON public.bank_accounts
          FOR SELECT USING (auth.uid() = user_id);
          
        CREATE POLICY insert_own_accounts ON public.bank_accounts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY update_own_accounts ON public.bank_accounts
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE POLICY delete_own_accounts ON public.bank_accounts
          FOR DELETE USING (auth.uid() = user_id);
      `
    });
    
    if (createError) {
      console.error('Error creating bank_accounts table:', createError);
      return { success: false, error: createError.message };
    }
    
    console.log('Successfully created bank_accounts table');
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in createBankAccountsTable:', errorMessage);
    return { success: false, error: errorMessage };
  }
} 