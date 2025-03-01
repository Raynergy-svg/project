import { useState, useCallback } from 'react';
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

// Additional interface for the connectAccount function
interface ConnectAccountParams {
  id: string;
  institutionName: string;
  accountType: string;
  accountName: string;
  balance: number;
  lastUpdated: Date;
  status: string;
}

interface UseBankConnectionReturn {
  accounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
  openBankConnection: () => void;
  refreshAccounts: () => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  connectAccount: (accountData: ConnectAccountParams) => void;
}

// Mock bank accounts data
const mockAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Chase Checking',
    type: 'checking',
    balance: 2500,
    lastUpdated: new Date(),
    institution: 'Chase',
    accountNumber: '****1234'
  },
  {
    id: 'acc-2',
    name: 'Chase Savings',
    type: 'savings',
    balance: 10000,
    lastUpdated: new Date(),
    institution: 'Chase',
    accountNumber: '****5678'
  },
  {
    id: 'acc-3',
    name: 'Amex Credit Card',
    type: 'credit',
    balance: -1500,
    lastUpdated: new Date(),
    institution: 'American Express',
    accountNumber: '****9012'
  }
];

export function useBankConnection(): UseBankConnectionReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Mock function to open bank connection
  const openBankConnection = useCallback(() => {
    console.log('Opening bank connection for user:', user?.id);
    // In a real app, this would open Plaid Link
    // For demo purposes, we'll just log it
  }, [user?.id]);

  // Mock function to refresh accounts
  const refreshAccounts = useCallback(async () => {
    console.log('Refreshing accounts for user:', user?.id);
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, use mock data
      setAccounts(mockAccounts);
      setError(null);
    } catch (err) {
      setError('Failed to refresh accounts');
      console.error('Error refreshing accounts:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [user?.id]);

  // Mock function to disconnect an account
  const disconnectAccount = useCallback(async (accountId: string) => {
    console.log('Disconnecting account:', accountId);
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove the account from state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      setError(null);
    } catch (err) {
      setError('Failed to disconnect account');
      console.error('Error disconnecting account:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, []);

  // Mock function to connect a new account
  const connectAccount = useCallback((accountData: ConnectAccountParams) => {
    console.log('Connecting new account:', accountData);
    setIsLoading(true);
    
    try {
      // Convert the account data to our internal format
      const newAccount: BankAccount = {
        id: accountData.id,
        name: accountData.accountName,
        type: accountData.accountType as 'checking' | 'savings' | 'credit',
        balance: accountData.balance,
        lastUpdated: accountData.lastUpdated,
        institution: accountData.institutionName,
        accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`
      };
      
      // Add the new account to state
      setAccounts(prev => [...prev, newAccount]);
      setError(null);
    } catch (err) {
      setError('Failed to connect account');
      console.error('Error connecting account:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    accounts,
    isLoading,
    error,
    openBankConnection,
    refreshAccounts,
    disconnectAccount,
    connectAccount
  };
} 