import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  lastUpdated: Date;
  institution: string;
  accountNumber: string;
  plaidItemId?: string;
  plaidAccountId?: string;
  institutionId?: string;
}

// Plaid Link token request response
interface LinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

// Plaid exchange public token response
interface ExchangeTokenResponse {
  access_token: string;
  item_id: string;
  request_id: string;
}

// Interface for the connectAccount function
export interface ConnectAccountParams {
  id: string;
  institutionName: string;
  accountType: string;
  accountName: string;
  balance: number;
  lastUpdated: Date;
  status: string;
  plaidItemId?: string;
  plaidAccountId?: string;
  institutionId?: string;
}

export interface UseBankConnectionReturn {
  accounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
  openBankConnection: () => void;
  refreshAccounts: () => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  connectAccount: (accountData: ConnectAccountParams) => void;
  linkToken: string | null;
  isPlaidReady: boolean;
}

export function useBankConnection(): UseBankConnectionReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidReady, setIsPlaidReady] = useState(false);
  const { user } = useAuth();

  // Initialize - Create tables if needed and get accounts
  useEffect(() => {
    const initialize = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Create the bank_accounts table if it doesn't exist
        // We'll try to create it, but won't show errors to the user if it fails
        try {
          const result = await createBankAccountsTable();
          if (!result.success) {
            console.error("Failed to create bank_accounts table:", result.error);
            // Continue anyway - the table will be created when needed
          }
        } catch (tableError) {
          console.error("Error setting up bank_accounts table:", tableError);
          // Continue anyway
        }
        
        // Fetch accounts (this function now handles missing tables gracefully)
        await fetchAccounts();
        
        // Get a link token for Plaid
        await getLinkToken();
        
        setIsPlaidReady(true);
      } catch (err) {
        console.error('Error initializing bank connections:', err);
        setError('Failed to initialize bank connections');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [user?.id]);

  // Fetch bank accounts from Supabase
  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id);
        
      if (fetchError) {
        // If the error is a missing table (42P01), we'll handle it gracefully
        if (fetchError.code === '42P01') {
          console.log('Bank accounts table does not exist yet - will be created when needed');
          // Return an empty array without showing an error to the user
          setAccounts([]);
          return;
        }
        
        throw fetchError;
      }
      
      if (data) {
        // Transform data to match our interface
        const transformedAccounts = data.map(acc => ({
          id: acc.id,
          name: acc.name,
          type: acc.type as 'checking' | 'savings' | 'credit',
          balance: acc.balance,
          lastUpdated: new Date(acc.last_updated),
          institution: acc.institution,
          accountNumber: acc.account_number,
          plaidItemId: acc.plaid_item_id,
          plaidAccountId: acc.plaid_account_id,
          institutionId: acc.institution_id
        }));
        
        setAccounts(transformedAccounts);
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      
      // Don't show errors to users for database setup issues
      if (err instanceof Error && 
          (err.message.includes('42P01') || err.message.includes('does not exist'))) {
        console.log('Bank accounts table does not exist yet');
        setAccounts([]);
      } else {
        setError('Failed to fetch bank accounts');
      }
    }
  }, [user?.id]);

  // Get a link token from Plaid
  const getLinkToken = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // In a real app, you would have a server endpoint to get a link token
      // For demonstration, we'll mock this response
      // const response = await fetch('/api/plaid/create-link-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: user.id })
      // });
      // const data: LinkTokenResponse = await response.json();
      
      // Mock a link token for development
      const mockLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15);
      setLinkToken(mockLinkToken);
      
      // In production, you would use:
      // setLinkToken(data.link_token);
    } catch (err) {
      console.error('Error getting Plaid link token:', err);
      setError('Failed to initialize Plaid');
    }
  }, [user?.id]);

  // Open Plaid Link
  const openBankConnection = useCallback(() => {
    // This function will be called by the component
    // The actual Plaid Link opening happens in the component using usePlaidLink
    console.log('Ready to open Plaid Link with token:', linkToken);
    
    // For our mock implementation, we'll just make sure we have a link token
    if (!linkToken) {
      getLinkToken();
    }
  }, [linkToken, getLinkToken]);

  // Refresh accounts
  const refreshAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchAccounts();
    } catch (err) {
      setError('Failed to refresh accounts');
      console.error('Error refreshing accounts:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [fetchAccounts]);

  // Disconnect an account
  const disconnectAccount = useCallback(async (accountId: string) => {
    if (!user?.id) return Promise.resolve();
    
    setIsLoading(true);
    
    try {
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Remove from state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      // In a real app, you might also want to remove the Plaid Item via your server
    } catch (err) {
      setError('Failed to disconnect account');
      console.error('Error disconnecting account:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [user?.id]);

  // Connect a new account
  const connectAccount = useCallback(async (accountData: ConnectAccountParams) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          name: accountData.accountName,
          type: accountData.accountType,
          balance: accountData.balance,
          institution: accountData.institutionName,
          account_number: `****${Math.floor(1000 + Math.random() * 9000)}`,
          plaid_item_id: accountData.plaidItemId,
          plaid_account_id: accountData.plaidAccountId,
          institution_id: accountData.institutionId,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      if (data) {
        // Add to state
        const newAccount: BankAccount = {
          id: data.id,
          name: data.name,
          type: data.type as 'checking' | 'savings' | 'credit',
          balance: data.balance,
          lastUpdated: new Date(data.last_updated),
          institution: data.institution,
          accountNumber: data.account_number,
          plaidItemId: data.plaid_item_id,
          plaidAccountId: data.plaid_account_id,
          institutionId: data.institution_id
        };
        
        setAccounts(prev => [...prev, newAccount]);
      }
    } catch (err) {
      setError('Failed to connect account');
      console.error('Error connecting account:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    accounts,
    isLoading,
    error,
    openBankConnection,
    refreshAccounts,
    disconnectAccount,
    connectAccount,
    linkToken,
    isPlaidReady
  };
} 