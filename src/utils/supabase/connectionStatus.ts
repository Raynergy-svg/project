import { supabase } from './client';

/**
 * Checks if the Supabase connection is working properly
 * This can be used to diagnose issues with the Supabase API
 */
export async function checkSupabaseConnection(): Promise<{
  isConnected: boolean;
  hasValidUser: boolean;
  canAccessBankAccounts: boolean;
  error?: string;
}> {
  const result = {
    isConnected: false,
    hasValidUser: false,
    canAccessBankAccounts: false,
    error: undefined as string | undefined
  };
  
  try {
    // Check if we can connect to Supabase at all
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      result.error = `Authentication error: ${authError.message}`;
      return result;
    }
    
    result.isConnected = true;
    result.hasValidUser = !!authData.session?.user;
    
    // Check if we can access the bank_accounts table
    const { data, error: tableError } = await supabase
      .from('bank_accounts')
      .select('id')
      .limit(1);
    
    if (tableError) {
      if (tableError.code === '42P01') {
        result.error = 'bank_accounts table does not exist';
      } else if (tableError.status === 404) {
        result.error = 'API endpoint returned 404 - possible connection issues';
      } else {
        result.error = `Table access error: ${tableError.message}`;
      }
      return result;
    }
    
    result.canAccessBankAccounts = true;
    return result;
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    return result;
  }
}

/**
 * Formats the connection status for display
 */
export function formatConnectionStatus(status: Awaited<ReturnType<typeof checkSupabaseConnection>>): string {
  return `
Connection Status:
-----------------
Connected to Supabase: ${status.isConnected ? '✅' : '❌'}
Valid User Session: ${status.hasValidUser ? '✅' : '❌'}
Can Access Bank Accounts: ${status.canAccessBankAccounts ? '✅' : '❌'}
${status.error ? `Error: ${status.error}` : ''}
`;
} 