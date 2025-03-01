import { useState } from 'react';
import { User } from '@/types';

// Types for bank connection
export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'mortgage';
  balance: number;
  availableBalance?: number;
  currency: string;
  lastUpdated: Date;
  institution: {
    id: string;
    name: string;
    logo?: string;
  };
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  isIncome: boolean;
  pending: boolean;
  merchantName?: string;
  merchantLogo?: string;
}

export interface BankConnectionData {
  accounts: BankAccount[];
  transactions: Transaction[];
}

export interface BankConnectionOptions {
  onSuccess?: (data: BankConnectionData) => void;
  onExit?: () => void;
  userId: string;
}

// This would typically use a third-party service like Plaid, Teller, or MX
export class BankConnectionService {
  private static instance: BankConnectionService;
  private apiUrl: string = import.meta.env.VITE_BANK_API_URL || 'https://api.example.com/banking';
  private apiKey: string = import.meta.env.VITE_BANK_API_KEY || '';

  private constructor() {}

  public static getInstance(): BankConnectionService {
    if (!BankConnectionService.instance) {
      BankConnectionService.instance = new BankConnectionService();
    }
    return BankConnectionService.instance;
  }

  // Initialize bank connection flow
  public async initializeConnection(options: BankConnectionOptions): Promise<void> {
    try {
      // In a real implementation, this would open a secure iframe or redirect to a bank selection UI
      console.log('Initializing bank connection for user:', options.userId);
      
      // For now, we'll simulate a successful connection with a timeout
      setTimeout(() => {
        if (options.onSuccess) {
          options.onSuccess(this.getMockInitialData());
        }
      }, 2000);
    } catch (error) {
      console.error('Error initializing bank connection:', error);
      if (options.onExit) {
        options.onExit();
      }
    }
  }

  // Fetch user's bank accounts
  public async fetchAccounts(userId: string): Promise<BankAccount[]> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      // Return empty array for now, but in production would handle this differently
      return [];
    }
  }

  // Fetch user's transactions
  public async fetchTransactions(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      let url = `${this.apiUrl}/transactions?userId=${userId}`;
      
      if (options?.startDate) {
        url += `&startDate=${options.startDate.toISOString()}`;
      }
      
      if (options?.endDate) {
        url += `&endDate=${options.endDate.toISOString()}`;
      }
      
      if (options?.accountIds?.length) {
        url += `&accountIds=${options.accountIds.join(',')}`;
      }
      
      if (options?.limit) {
        url += `&limit=${options.limit}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array for now, but in production would handle this differently
      return [];
    }
  }

  // Disconnect a bank account
  public async disconnectAccount(accountId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts/${accountId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      return false;
    }
  }

  // This is a temporary method that will be removed once real API integration is complete
  private getMockInitialData(): BankConnectionData {
    return {
      accounts: [
        {
          id: 'acc_1',
          name: 'Primary Checking',
          type: 'checking',
          balance: 2450.75,
          availableBalance: 2450.75,
          currency: 'USD',
          lastUpdated: new Date(),
          institution: {
            id: 'inst_1',
            name: 'Chase Bank',
            logo: 'https://logo.clearbit.com/chase.com'
          }
        },
        {
          id: 'acc_2',
          name: 'Savings Account',
          type: 'savings',
          balance: 12500.50,
          availableBalance: 12500.50,
          currency: 'USD',
          lastUpdated: new Date(),
          institution: {
            id: 'inst_1',
            name: 'Chase Bank',
            logo: 'https://logo.clearbit.com/chase.com'
          }
        },
        {
          id: 'acc_3',
          name: 'Credit Card',
          type: 'credit',
          balance: -3250.45,
          currency: 'USD',
          lastUpdated: new Date(),
          institution: {
            id: 'inst_2',
            name: 'American Express',
            logo: 'https://logo.clearbit.com/americanexpress.com'
          }
        }
      ],
      transactions: []
    };
  }
}

// React hook for bank connection
export function useBankConnection(userId: string) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const bankService = BankConnectionService.getInstance();

  const connectBank = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await bankService.initializeConnection({
        userId,
        onSuccess: (data) => {
          setAccounts(data.accounts);
          setTransactions(data.transactions);
          setIsConnecting(false);
        },
        onExit: () => {
          setIsConnecting(false);
          setError('Bank connection was canceled');
        }
      });
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to connect to bank');
      console.error('Bank connection error:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await bankService.fetchAccounts(userId);
      setAccounts(fetchedAccounts);
      return fetchedAccounts;
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
      return [];
    }
  };

  const fetchTransactions = async (options?: {
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    limit?: number;
  }) => {
    try {
      const fetchedTransactions = await bankService.fetchTransactions(userId, options);
      setTransactions(fetchedTransactions);
      return fetchedTransactions;
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      return [];
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const success = await bankService.disconnectAccount(accountId);
      if (success) {
        setAccounts(accounts.filter(account => account.id !== accountId));
      }
      return success;
    } catch (err) {
      setError('Failed to disconnect account');
      console.error('Error disconnecting account:', err);
      return false;
    }
  };

  return {
    isConnecting,
    accounts,
    transactions,
    error,
    connectBank,
    fetchAccounts,
    fetchTransactions,
    disconnectAccount
  };
} 