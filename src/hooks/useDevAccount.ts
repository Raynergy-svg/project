import { useState, useCallback, useMemo } from 'react';

interface DevAccount {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

/**
 * Hook to handle development accounts in dev mode
 */
export function useDevAccount() {
  // List of development accounts for local testing
  const devAccounts = useMemo<DevAccount[]>(() => {
    return [
      {
        id: '00000000-0000-0000-0000-000000000001', // Fixed UUID format for dev user 1
        email: 'dev@example.com',
        name: 'Development User',
        isPremium: true
      },
      {
        id: '00000000-0000-0000-0000-000000000002', // Fixed UUID format for dev user 2
        email: 'free@example.com',
        name: 'Free User',
        isPremium: false
      }
    ];
  }, []);

  // Check if email matches a dev account
  const isDevAccount = useCallback((email: string): boolean => {
    if (!email) return false;
    return devAccounts.some(account => account.email.toLowerCase() === email.toLowerCase());
  }, [devAccounts]);

  // Get dev account by email
  const getDevAccount = useCallback((email: string): DevAccount | null => {
    if (!email) return null;
    return devAccounts.find(account => account.email.toLowerCase() === email.toLowerCase()) || null;
  }, [devAccounts]);

  // Verify dev credentials (any password works for dev accounts)
  const verifyDevCredentials = useCallback((email: string, password: string): { valid: boolean, account: DevAccount | null } => {
    const account = getDevAccount(email);
    return {
      valid: !!account && password.length > 0,
      account
    };
  }, [getDevAccount]);

  return {
    isDevAccount,
    getDevAccount,
    verifyDevCredentials,
    devAccounts
  };
}

export default useDevAccount; 