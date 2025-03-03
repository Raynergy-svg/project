import { useState } from 'react';

interface DevAccount {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

const DEV_ACCOUNTS = [
  {
    id: 'dev-user-1',
    email: 'dev@example.com',
    name: 'Dev User',
    isPremium: true
  },
  {
    id: 'dev-user-2',
    email: 'test@example.com',
    name: 'Test User',
    isPremium: false
  }
];

/**
 * Hook to provide development account functionality
 * Only for use in development environment!
 */
export function useDevAccount() {
  const [accounts] = useState<DevAccount[]>(DEV_ACCOUNTS);
  
  /**
   * Find a dev account by email
   */
  const findDevAccount = (email: string): DevAccount | undefined => {
    return accounts.find(account => account.email.toLowerCase() === email.toLowerCase());
  };
  
  /**
   * Check if email is a valid dev account
   */
  const isDevAccount = (email: string): boolean => {
    return !!findDevAccount(email);
  };
  
  /**
   * Verify dev account credentials
   * In development mode, any password is accepted for dev accounts
   */
  const verifyDevCredentials = (email: string, password: string): { valid: boolean; account?: DevAccount } => {
    // For development, we'll accept any password for dev accounts
    const account = findDevAccount(email);
    
    if (!account) {
      return { valid: false };
    }
    
    // In development mode, password can be anything for dev accounts
    return { 
      valid: true,
      account
    };
  };
  
  return {
    isDevAccount,
    verifyDevCredentials,
    findDevAccount,
    devAccounts: accounts
  };
}

export default useDevAccount; 