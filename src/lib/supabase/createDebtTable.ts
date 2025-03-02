import { supabase } from '@/lib/supabase/client';

/**
 * Creates the debts table in Supabase if it doesn't exist
 * This should be run once when the application first initializes
 */
export async function createDebtTable(): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Checking if debts table exists...');
    
    // Check if the table already exists by attempting to query it
    const { error: checkError } = await supabase
      .from('debts')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    // If there's no error, table exists
    if (!checkError) {
      console.log('Debts table already exists');
      return { success: true, error: null };
    }
    
    // If the error is not the table-doesn't-exist error, something else is wrong
    if (checkError.code !== '42P01') {
      console.error('Unexpected error checking debts table:', checkError);
      return { success: false, error: checkError.message };
    }
    
    console.log('Debts table does not exist. Creating it now...');
    
    // Execute SQL to create the table (using RPC to execute SQL directly)
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.debts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          interest_rate DECIMAL(6,2) NOT NULL,
          minimum_payment DECIMAL(15,2) NOT NULL,
          due_date DATE,
          notes TEXT,
          priority INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          institution_id TEXT,
          account_id TEXT,
          plaid_item_id TEXT,
          last_updated_from_bank TIMESTAMP WITH TIME ZONE
        );
        
        -- Add indexes for better query performance
        CREATE INDEX IF NOT EXISTS debts_user_id_idx ON public.debts (user_id);
        CREATE INDEX IF NOT EXISTS debts_type_idx ON public.debts (type);
        
        -- Create RLS (Row Level Security) policies
        ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to see only their debts
        CREATE POLICY select_own_debts ON public.debts
          FOR SELECT USING (auth.uid() = user_id);
        
        -- Create policy to allow users to insert their own debts
        CREATE POLICY insert_own_debts ON public.debts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Create policy to allow users to update their own debts
        CREATE POLICY update_own_debts ON public.debts
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- Create policy to allow users to delete their own debts
        CREATE POLICY delete_own_debts ON public.debts
          FOR DELETE USING (auth.uid() = user_id);
      `
    });
    
    if (createError) {
      console.error('Error creating debts table:', createError);
      return { success: false, error: createError.message };
    }
    
    console.log('Successfully created debts table');
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in createDebtTable:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Checks if the Supabase project has the necessary execute_sql function
 * If not, it provides instructions on how to create it
 */
export async function checkExecuteSqlFunction(): Promise<{ exists: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql_query: 'SELECT 1;'
    });
    
    if (!error) {
      return { exists: true, message: 'execute_sql function exists' };
    }
    
    return { 
      exists: false, 
      message: 'The execute_sql function does not exist in your Supabase project. Please create it following these steps:\n\n' +
      '1. Go to your Supabase dashboard\n' +
      '2. Go to SQL Editor\n' +
      '3. Create a new query with the following SQL:\n\n' +
      'CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)\n' +
      'RETURNS VOID\n' +
      'LANGUAGE plpgsql\n' +
      'SECURITY DEFINER\n' +
      'AS $$\n' +
      'BEGIN\n' +
      '  EXECUTE sql_query;\n' +
      'END;\n' +
      '$$;\n\n' +
      '4. Run the query\n' +
      '5. Restart your application'
    };
  } catch (error) {
    return { 
      exists: false, 
      message: 'Error checking for execute_sql function: ' + (error instanceof Error ? error.message : String(error))
    };
  }
} 