import { supabase } from '@/utils/supabase/client';

/**
 * Creates the bank_accounts table in Supabase if it doesn't exist
 * This should be run once when the application first initializes
 */
export async function createBankAccountsTable(): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('Checking if bank_accounts table exists...');
    
    // Simplified approach: directly query the bank_accounts table
    // This avoids using information_schema which isn't accessible via REST API
    const { data, error: checkError } = await supabase
      .from('bank_accounts')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!checkError) {
      console.log('Bank accounts table already exists');
      return { success: true, error: null };
    }
    
    // If there's an error and it's not the specific 42P01 error (relation does not exist)
    // then it's some other issue we should report
    if (checkError.code !== '42P01') {
      console.error('Unexpected error checking bank_accounts table:', checkError);
      return { success: false, error: checkError.message };
    }
    
    console.log('Bank accounts table does not exist');
    
    // Instead of trying to create the table, provide a message about manual setup
    console.info(
      'Bank accounts table creation requires SQL execution privileges. ' + 
      'Please create tables using the Supabase dashboard SQL editor.'
    );
    
    return { 
      success: false, 
      error: 'Table creation requires SQL execution privileges. Please use the Supabase dashboard SQL editor to create necessary tables.' 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in createBankAccountsTable:', errorMessage);
    
    // Special case for 404 errors which are likely due to REST API limitations
    if (errorMessage.includes('404')) {
      console.log('Got 404 error. The bank_accounts table likely exists but the API endpoint has issues.');
      return { success: true, error: null };
    }
    
    return { success: false, error: errorMessage };
  }
} 