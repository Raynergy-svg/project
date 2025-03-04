import { supabase } from '@/utils/supabase/client';

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
    
    console.log('Debts table does not exist');
    
    // Instead of trying to create the table directly, inform the user to create it manually
    // This is a graceful fallback when the execute_sql function is not available
    console.info(
      'Table creation requires SQL execution privileges. Please create tables using the Supabase dashboard SQL editor.'
    );
    
    return { 
      success: false, 
      error: 'Table creation requires SQL execution privileges. Please use the Supabase dashboard SQL editor to create necessary tables.' 
    };
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
    
    // Enhanced error message with more context
    console.info('The execute_sql function is not available. This is normal if you have not configured it.');
    
    return { 
      exists: false, 
      message: 'The execute_sql function does not exist in your Supabase project. This is normal for most setups.\n\n' +
      'If you need to create tables, you can do so using the Supabase dashboard SQL editor.'
    };
  } catch (error) {
    return { 
      exists: false, 
      message: 'Error checking for execute_sql function: ' + (error instanceof Error ? error.message : String(error))
    };
  }
} 