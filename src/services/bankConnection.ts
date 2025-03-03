import { useState } from 'react';
import { User } from '@/types';
import { MOCK_BANK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BANK_CONNECTION_DATA } from '@/utils/mockData';

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
  private apiUrl: string;
  private apiKey: string;
  private isMockMode: boolean;
  private useRealData: boolean = true; // Default to real data

  private constructor() {
    this.apiUrl = import.meta.env.VITE_BANK_API_URL || '';
    this.apiKey = import.meta.env.VITE_BANK_API_KEY || '';
    // Determine if we're in mock mode (no real API configured)
    this.isMockMode = !this.apiUrl || !this.apiKey;
    
    // Always force real data in production environment
    if (import.meta.env.PROD) {
      this.useRealData = true;
    }
    
    // Only log this once during initialization
    if (this.isMockMode) {
      console.info('Bank API not configured. Running in mock mode with empty data.');
    }
  }

  public static getInstance(): BankConnectionService {
    if (!BankConnectionService.instance) {
      BankConnectionService.instance = new BankConnectionService();
    }
    return BankConnectionService.instance;
  }

  // Get whether real data should be used
  public getUseRealData(): boolean {
    // Always force real data in production
    if (import.meta.env.PROD) {
      return true;
    }
    return this.useRealData;
  }

  // Set whether real data should be used
  public setUseRealData(useReal: boolean): void {
    // Don't allow setting to mock data in production
    if (import.meta.env.PROD) {
      this.useRealData = true;
      console.warn('Mock data is not allowed in production. Forcing real data.');
      return;
    }
    this.useRealData = useReal;
  }

  // Initialize bank connection flow
  public async initializeConnection(options: BankConnectionOptions): Promise<void> {
    try {
      // In a real implementation, this would open a secure iframe or redirect to a bank selection UI
      console.log('Initializing bank connection for user:', options.userId);
      
      // Check if we can make real API call
      if (this.apiUrl && this.apiKey) {
        // Implement real API call here
        console.log('Using real bank API connection');
      } else {
        // Simulate a successful connection with timeout (temporary)
        setTimeout(() => {
          if (options.onSuccess) {
            options.onSuccess(this.getEmptyConnectionData());
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error initializing bank connection:', error);
      if (options.onExit) {
        options.onExit();
      }
    }
  }

  // Fetch user's bank accounts
  public async fetchAccounts(userId: string): Promise<BankAccount[]> {
    // Return mock data immediately if in mock mode
    if (this.isMockMode) {
      return [];
    }

    try {
      const response = await fetch(`${this.apiUrl}/accounts?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  public async fetchTransactions(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      if (this.apiUrl && this.apiKey) {
        // Make real API call
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
      } else {
        // Return empty array if no real API is configured
        console.warn('No bank API configured. Returning empty transactions array.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  public async disconnectAccount(accountId: string): Promise<boolean> {
    try {
      if (this.apiUrl && this.apiKey) {
        // Make real API call
        const response = await fetch(`${this.apiUrl}/accounts/${accountId}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        return response.ok;
      } else {
        // Simulate success if no real API is configured
        console.warn('No bank API configured. Simulating successful account disconnection.');
        return true;
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      return false;
    }
  }

  // Return empty connection data
  private getEmptyConnectionData(): BankConnectionData {
    return {
      accounts: [],
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