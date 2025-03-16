'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';
import { BankConnectionService, BankAccount, Transaction } from '../services/bankConnection';

// Mock accounts data
const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'acct_123456',
    name: 'Chase Checking',
    type: 'checking',
    balance: 2543.21,
    lastUpdated: new Date(),
    institution: 'Chase',
    accountNumber: '****4567',
    plaidItemId: 'item_12345',
    plaidAccountId: 'account_12345',
    institutionId: 'ins_123'
  },
  {
    id: 'acct_234567',
    name: 'Chase Credit Card',
    type: 'credit',
    balance: -1250.75,
    lastUpdated: new Date(),
    institution: 'Chase',
    accountNumber: '****5678',
    plaidItemId: 'item_12345',
    plaidAccountId: 'account_23456',
    institutionId: 'ins_123'
  },
  {
    id: 'acct_345678',
    name: 'Bank of America Savings',
    type: 'savings',
    balance: 8750.42,
    lastUpdated: new Date(),
    institution: 'Bank of America',
    accountNumber: '****6789',
    plaidItemId: 'item_23456',
    plaidAccountId: 'account_34567',
    institutionId: 'ins_234'
  }
];

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
  isMockDataEnabled: boolean;
  toggleMockData: (useMock: boolean) => void;
}

export function useBankConnection(): UseBankConnectionReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidReady, setIsPlaidReady] = useState(true); // Set to true by default
  const [isMockDataEnabled, setIsMockDataEnabled] = useState(true); // Always use mock data
  const { user } = useAuth();

  // Initialize - Load mock accounts data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Load mock accounts instead of trying to create tables
        setAccounts(MOCK_BANK_ACCOUNTS);
        
        // Set a mock link token
        const mockLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15);
        setLinkToken(mockLinkToken);
        
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

  // Fetch bank accounts - returns mock data instead of calling Supabase
  const fetchAccounts = useCallback(async () => {
    try {
      // Return mock accounts
      setAccounts(MOCK_BANK_ACCOUNTS);
      return MOCK_BANK_ACCOUNTS;
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to fetch bank accounts');
      return [];
    }
  }, []);

  // Get a mock link token
  const getLinkToken = useCallback(async () => {
    try {
      // Create a mock link token
      const mockLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15);
      setLinkToken(mockLinkToken);
    } catch (err) {
      console.error('Error getting Plaid link token:', err);
      setError('Failed to initialize Plaid');
    }
  }, []);

  // Open Plaid Link - simulated
  const openBankConnection = useCallback(() => {
    console.log('Simulating opening Plaid Link with token:', linkToken);
    // Simulate successful connection by adding a mock account after a delay
    setTimeout(() => {
      const newAccount: BankAccount = {
        id: 'acct_' + Math.random().toString(36).substring(2, 9),
        name: 'New Connected Account',
        type: 'checking',
        balance: 1234.56,
        lastUpdated: new Date(),
        institution: 'New Bank',
        accountNumber: '****' + Math.floor(1000 + Math.random() * 9000).toString(),
      };
      
      setAccounts(prev => [...prev, newAccount]);
    }, 2000);
  }, [linkToken]);

  // Refresh accounts - load mock data
  const refreshAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchAccounts();
    } catch (err) {
      setError('Failed to refresh accounts');
      console.error('Error refreshing accounts:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [fetchAccounts]);

  // Disconnect an account - simulate success
  const disconnectAccount = useCallback(async (accountId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      setError('Failed to disconnect account');
      console.error('Error disconnecting account:', err);
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, []);

  // Connect account - simulate adding a new account
  const connectAccount = useCallback((accountData: ConnectAccountParams) => {
    // Create a new account from the provided data
    const newAccount: BankAccount = {
      id: accountData.id,
      name: accountData.accountName,
      type: accountData.accountType as 'checking' | 'savings' | 'credit',
      balance: accountData.balance,
      lastUpdated: accountData.lastUpdated,
      institution: accountData.institutionName,
      accountNumber: '****' + Math.floor(1000 + Math.random() * 9000).toString(),
      plaidItemId: accountData.plaidItemId,
      plaidAccountId: accountData.plaidAccountId,
      institutionId: accountData.institutionId
    };
    
    // Add to state
    setAccounts(prev => [...prev, newAccount]);
  }, []);

  // Toggle between mock and real data
  const toggleMockData = useCallback((useMock: boolean) => {
    setIsMockDataEnabled(useMock);
    BankConnectionService.getInstance().setUseRealData(!useMock);
    
    // Reload accounts
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    openBankConnection,
    refreshAccounts,
    disconnectAccount,
    connectAccount,
    linkToken,
    isPlaidReady,
    isMockDataEnabled,
    toggleMockData
  };
} 