import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '@/contexts/AuthContext';

interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  lastUpdated: Date;
  institution: string;
  accountNumber: string;
}

interface UseBankConnectionReturn {
  accounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
  openBankConnection: () => void;
  refreshAccounts: () => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
}

export function useBankConnection(): UseBankConnectionReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize Plaid Link
  const { open: openPlaid, ready } = usePlaidLink({
    token: null, // You'll need to get this from your backend
    onSuccess: async (public_token, metadata) => {
      try {
        setIsLoading(true);
        // Exchange public token for access token on your backend
        const response = await fetch('/api/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            public_token,
            userId: user?.id,
            metadata 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect bank account');
        }

        await refreshAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect bank account');
      } finally {
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) setError(err.message);
    },
  });

  const openBankConnection = useCallback(() => {
    if (ready) {
      openPlaid();
    }
  }, [ready, openPlaid]);

  const refreshAccounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const disconnectAccount = useCallback(async (accountId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account');
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
  };
} 