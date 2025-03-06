import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Link, 
  Unlink, 
  Clock, 
  Shield, 
  LockKeyhole,
  CreditCard,
  Wallet,
  WifiOff,
  Banknote,
  PiggyBank,
  ChevronDown,
  Trash2,
  Search,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBankConnection } from '@/hooks/useBankConnection';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePlaidLink } from 'react-plaid-link';
import { createDebtTable } from '@/lib/supabase/createDebtTable';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Create a separate component for Plaid Link to avoid race conditions
// This is a workaround for the known issue with Plaid Link initialization
// See: https://github.com/plaid/react-plaid-link/issues/86
const PlaidLinkButton = ({ 
  config, 
  onSuccess, 
  disabled = false,
  className = ""
}: { 
  config: Parameters<typeof usePlaidLink>[0], 
  onSuccess: () => void,
  disabled?: boolean,
  className?: string
}) => {
  const { open, ready, error } = usePlaidLink(config);
  
  useEffect(() => {
    if (error) {
      console.error('Plaid Link Error:', error);
    }
  }, [error]);
  
  return (
    <Button
      onClick={() => {
        if (ready) {
          open();
        }
      }}
      disabled={!ready || disabled}
      className={className}
    >
      Connect Bank
    </Button>
  );
};

export function BankConnections() {
  const { accounts, isLoading, error, openBankConnection, refreshAccounts, disconnectAccount, linkToken, isPlaidReady } = useBankConnection();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [debtsTableInitialized, setDebtsTableInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPlaidButton, setShowPlaidButton] = useState(false);
  
  // Simplified list of available banks (would typically come from Plaid)
  const availableBanks = [
    { id: 'chase', name: 'Chase', logo: 'https://logo.clearbit.com/chase.com' },
    { id: 'bofa', name: 'Bank of America', logo: 'https://logo.clearbit.com/bankofamerica.com' },
    { id: 'wells', name: 'Wells Fargo', logo: 'https://logo.clearbit.com/wellsfargo.com' },
    { id: 'citi', name: 'Citibank', logo: 'https://logo.clearbit.com/citibank.com' },
    { id: 'capital', name: 'Capital One', logo: 'https://logo.clearbit.com/capitalone.com' },
  ];
  
  // Initialize database tables if needed
  const handleInitializeDebtsTable = async () => {
    setIsInitializing(true);
    try {
      // We'll handle this internally without bothering the user
      await createBankAccountsTable();
      setDebtsTableInitialized(true);
      setInitError(null);
    } catch (error) {
      console.error('Error initializing debts table:', error);
      // Instead of showing a database error to the user, show a more friendly message
      setInitError("We encountered an issue setting up your account. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Add an effect to delay showing the Plaid button to avoid race conditions
  useEffect(() => {
    // Delay showing the Plaid button to ensure scripts are loaded
    const timer = setTimeout(() => {
      setShowPlaidButton(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle opening Plaid Link
  const handleOpenPlaid = () => {
    if (showPlaidButton) {
      // The PlaidLinkButton component handles opening Plaid
      // This function is just a placeholder for the handleConnectBankAccount function
      console.log('Opening Plaid Link through the PlaidLinkButton component');
    }
  };
  
  // Config for the Plaid Link component
  const config: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess: (public_token, metadata) => {
      console.log('Success!', public_token, metadata);
      
      // In a real app, you would exchange this token for an access token on your backend
      // For our demo, we'll simulate connecting a bank account
      if (metadata.institution && metadata.accounts && metadata.accounts.length > 0) {
        // Process all accounts from the connection
        const accountsToConnect = metadata.accounts.map(account => ({
          id: 'acc-' + Math.random().toString(36).substring(2, 15),
          institutionName: metadata.institution.name,
          accountType: account.type,
          accountName: account.name,
          accountNumber: account.mask,
          balance: account.balances?.current || Math.floor(Math.random() * 10000) / 100, // Use real balance if available
          lastUpdated: new Date(),
          status: 'active',
          plaidItemId: metadata.item_id,
          plaidAccountId: account.id,
          institutionId: metadata.institution.institution_id
        }));
        
        // Connect all accounts
        Promise.all(accountsToConnect.map(acc => connectAccount(acc)))
          .then(() => {
            // Show a success message
            alert(`Successfully connected ${accountsToConnect.length} accounts from ${metadata.institution.name}`);
            
            // Navigate to dashboard after successful connection
            navigate('/dashboard');
          })
          .catch(err => {
            console.error('Error connecting accounts:', err);
            alert('There was an issue connecting your accounts. Please try again.');
          });
      }
      
      setShowConnectModal(false);
      setSelectedBank(null);
    },
    onExit: (err, metadata) => {
      console.log('Exit!', err, metadata);
      setShowConnectModal(false);
      setSelectedBank(null);
      
      // Show helpful message if there was an error
      if (err) {
        alert(`Connection error: ${err.display_message || err.error_message || 'Please try again later.'}`);
      }
    },
    onEvent: (eventName, metadata) => {
      // Log Plaid Link events for debugging
      console.log('Plaid event:', eventName, metadata);
    },
  };
  
  // Handle connecting a mock bank account
  const handleConnectBankAccount = (bankId: string) => {
    setSelectedBank(bankId);
    
    // In a real app, we would use Plaid Link here
    // For our mock, we'll add a random account
    const selectedBank = availableBanks.find(bank => bank.id === bankId);
    
    if (!selectedBank) return;
    
    if (showPlaidButton && linkToken) {
      try {
        // Use real Plaid Link if ready
        handleOpenPlaid();
      } catch (err) {
        console.error('Error opening Plaid Link:', err);
        alert('There was an issue opening the bank connection flow. Please try again.');
      }
    } else {
      // Show loading UI during mock connection
      setIsConnecting(true);
      
      // Use mock data if Plaid is not set up
      setTimeout(() => {
        const accountTypes = ['checking', 'savings', 'credit'];
        const randomType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        
        // For demo purposes, create a random number of accounts
        const numAccounts = Math.floor(Math.random() * 3) + 1;
        const mockAccounts = [];
        
        for (let i = 0; i < numAccounts; i++) {
          const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
          mockAccounts.push({
            id: 'acc-' + Math.random().toString(36).substring(2, 15),
            institutionName: selectedBank.name,
            accountType: accountType,
            accountName: `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account ${i + 1}`,
            accountNumber: Math.floor(Math.random() * 9000 + 1000).toString(), // Mock 4-digit mask
            balance: Math.floor(Math.random() * 10000) / 100,
            lastUpdated: new Date(),
            status: 'active'
          });
        }
        
        // Connect all mock accounts
        Promise.all(mockAccounts.map(acc => connectAccount(acc)))
          .then(() => {
            // Show a success message
            alert(`Successfully connected ${mockAccounts.length} accounts from ${selectedBank.name}`);
            
            // Navigate to dashboard after successful connection
            navigate('/dashboard');
          })
          .catch(err => {
            console.error('Error connecting mock accounts:', err);
          })
          .finally(() => {
            setIsConnecting(false);
            setShowConnectModal(false);
            setSelectedBank(null);
          });
      }, 2000);
    }
  };
  
  // Handle disconnecting an account
  const handleDisconnectAccount = async (accountId: string) => {
    await disconnectAccount(accountId);
  };
  
  // Handle refreshing accounts
  const handleRefreshAccounts = async () => {
    await refreshAccounts();
  };
  
  // Toggle account details
  const toggleAccountDetails = (accountId: string) => {
    setActiveAccount(prevId => prevId === accountId ? null : accountId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Bank Connections</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshAccounts}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-center py-6 px-6 bg-black/20 rounded-lg border border-white/10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#88B04B] mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white">Loading accounts</h3>
          <p className="text-white/70 mt-2">Please wait...</p>
        </div>
      )}
      
      {!isLoading && (
        <>
          {accounts.length === 0 && (
            <div className="text-center py-12 px-6 bg-black/20 rounded-lg border border-white/10">
              <Banknote className="h-12 w-12 mx-auto mb-4 text-[#88B04B]" />
              <h3 className="text-lg font-medium text-white">Connect your bank account</h3>
              <p className="text-white/70 mt-2 mb-6">
                Link your bank accounts to automatically import your financial data
              </p>
              
              {showPlaidButton ? (
                <PlaidLinkButton 
                  config={config}
                  onSuccess={() => {
                    console.log('Bank connected successfully');
                    handleRefreshAccounts();
                  }}
                  disabled={isLoading}
                  className="bg-[#88B04B] hover:bg-[#7a9d43] text-white"
                />
              ) : (
                <Button disabled className="bg-[#88B04B] hover:bg-[#7a9d43] text-white">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </Button>
              )}
            </div>
          )}
          
          {accounts.length > 0 && (
            <Card className="overflow-hidden bg-black border border-white/10 shadow-sm">
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Your Accounts</CardTitle>
                  {showPlaidButton && (
                    <PlaidLinkButton 
                      config={config}
                      onSuccess={() => {
                        console.log('Additional bank connected');
                        handleRefreshAccounts();
                      }}
                      disabled={isLoading}
                      className="bg-[#88B04B] hover:bg-[#7a9d43] text-white text-sm px-3 py-1 h-auto"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ul className="divide-y divide-white/10">
                  {accounts.map(account => (
                    <li key={account.id} className="p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAccountDetails(account.id)}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/30 text-blue-400">
                            {account.type === 'checking' && <Banknote className="w-5 h-5" />}
                            {account.type === 'savings' && <PiggyBank className="w-5 h-5" />}
                            {account.type === 'credit' && <CreditCard className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{account.name}</h4>
                            <p className="text-sm text-gray-400">{account.institution}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn(
                              "font-medium",
                              account.balance >= 0 ? "text-white" : "text-red-400"
                            )}>
                              {formatCurrency(account.balance)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Last updated: {account.lastUpdated.toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronDown className={cn(
                            "w-5 h-5 text-gray-400 transition-transform",
                            activeAccount === account.id && "transform rotate-180"
                          )} />
                        </div>
                      </div>
                      
                      {/* Account details (expanded view) */}
                      {activeAccount === account.id && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-medium text-gray-400">Account Type</p>
                              <p className="text-sm text-white capitalize">{account.type}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-400">Account Number</p>
                              <p className="text-sm text-white">{account.accountNumber}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-400 border-red-500/30 hover:bg-red-900/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnectAccount(account.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 