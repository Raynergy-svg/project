import { useState, useCallback } from 'react';
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
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBankConnection } from '@/hooks/useBankConnection';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
// Import usePlaidLink conditionally to avoid initialization errors
// import { usePlaidLink } from 'react-plaid-link';
import { createDebtTable } from '@/lib/supabase/createDebtTable';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Define type for Plaid Link config without importing the library
interface PlaidLinkOptions {
  token: string;
  onSuccess: (public_token: string, metadata: any) => void;
  onExit: (err: any, metadata: any) => void;
  onEvent: (eventName: string, metadata: any) => void;
}

export function BankConnections() {
  const { accounts, isLoading, error, openBankConnection, refreshAccounts, disconnectAccount, linkToken, isPlaidReady, isMockDataEnabled, connectAccount } = useBankConnection();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [debtsTableInitialized, setDebtsTableInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  
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
  
  // Handles opening the Plaid Link flow
  const handleOpenPlaid = useCallback(() => {
    if (isMockDataEnabled) {
      // In mock mode, directly show the connection modal without using Plaid
      setShowConnectModal(true);
      return;
    }
    
    if (!isPlaidReady) {
      console.log('Plaid not ready yet');
      return;
    }
    
    openBankConnection();
    setShowConnectModal(true);
  }, [isPlaidReady, openBankConnection, isMockDataEnabled]);
  
  // Config for the Plaid Link component - only used when mock data is disabled
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
  
  // Only import and use Plaid Link if we're not in mock mode
  // Removed: const { open, ready, error: plaidError } = usePlaidLink(config);
  // Instead use placeholder functions when in mock mode
  const ready = isMockDataEnabled ? true : false;
  
  // Mock implementation of Plaid's open function
  const open = () => {
    if (isMockDataEnabled) {
      console.log('Using mock Plaid Link flow');
      // Simulate the success callback with mock data
      simulateMockPlaidSuccess();
    } else {
      // This should never be called in mock mode, but adding as a fallback
      console.error('Real Plaid Link not available in mock mode');
      setPlaidError('Plaid Link not available in this environment');
    }
  };
  
  // Simulate Plaid success with mock data
  const simulateMockPlaidSuccess = () => {
    // Show loading UI
    setIsConnecting(true);
    
    // Use selected bank or default to first one
    const bank = selectedBank 
      ? availableBanks.find(b => b.id === selectedBank) 
      : availableBanks[0];
    
    if (!bank) {
      setIsConnecting(false);
      setPlaidError('Selected bank not found');
      return;
    }
    
    // Simulate network delay
    setTimeout(() => {
      const accountTypes = ['checking', 'savings', 'credit'];
      // Create 1-3 random accounts
      const numAccounts = Math.floor(Math.random() * 3) + 1;
      const mockAccounts = [];
      
      for (let i = 0; i < numAccounts; i++) {
        const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        mockAccounts.push({
          id: 'acc-' + Math.random().toString(36).substring(2, 15),
          institutionName: bank.name,
          accountType: accountType,
          accountName: `${bank.name} ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}`,
          balance: Math.floor(Math.random() * 10000) / 100,
          lastUpdated: new Date(),
          status: 'active'
        });
      }
      
      // Connect all mock accounts
      Promise.all(mockAccounts.map(acc => connectAccount(acc)))
        .then(() => {
          // Show a success message
          console.log(`Successfully connected ${mockAccounts.length} accounts from ${bank.name}`);
          
          // Navigate to dashboard after successful connection
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Error connecting mock accounts:', err);
          setPlaidError('Failed to connect mock accounts');
        })
        .finally(() => {
          setIsConnecting(false);
          setShowConnectModal(false);
          setSelectedBank(null);
        });
    }, 1500);
  };
  
  // Handle connecting a bank account
  const handleConnectBankAccount = (bankId: string) => {
    setSelectedBank(bankId);
    
    // In mock mode, always use our simulated Plaid flow
    if (isMockDataEnabled) {
      simulateMockPlaidSuccess();
      return;
    }
    
    // For real Plaid implementation
    if (ready && linkToken) {
      try {
        // Use real Plaid Link if ready
        open();
      } catch (err) {
        console.error('Error opening Plaid Link:', err);
        setPlaidError('There was an issue opening the bank connection flow. Please try again.');
      }
    } else {
      // Fallback to mock implementation if Plaid is not ready
      simulateMockPlaidSuccess();
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Connect Your Bank Accounts</h2>
        <p className="text-white/70 max-w-lg mx-auto">
          Securely connect your bank accounts to automatically import your financial data and get personalized insights
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-300">Connection Error</h4>
              <p className="text-sm text-red-200/80">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {plaidError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-300">Plaid Error</h4>
              <p className="text-sm text-red-200/80">{plaidError}</p>
            </div>
          </div>
        </div>
      )}
      
      {isConnecting ? (
        <div className="text-center py-12 px-6 bg-black/20 rounded-lg border border-white/10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#88B04B] mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white">Connecting to your bank</h3>
          <p className="text-white/70 mt-2">This may take a few moments...</p>
        </div>
      ) : accounts.length > 0 ? (
        <Card className="overflow-hidden bg-black border border-white/10 shadow-sm">
          <CardHeader className="pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">
                Connected Accounts
              </CardTitle>
              
              {accounts.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshAccounts}
                  disabled={isLoading}
                  className="h-8 gap-1 text-gray-300 hover:text-white"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span className="text-sm">Refresh</span>
                </Button>
              )}
            </div>
            <CardDescription className="text-sm text-gray-400">
              Connect your bank accounts to analyze your debts and get personalized insights
            </CardDescription>
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
            
            <div className="p-5 bg-white/5 border-t border-white/10">
              <Button
                onClick={handleOpenPlaid}
                variant="outline"
                className="w-full border-dashed border-white/20 bg-transparent text-gray-300 hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Another Account
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Empty state - no accounts connected
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Link className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Accounts Connected</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md">
            Connect your bank accounts securely with Plaid to enable AI-powered debt analysis 
            and get personalized financial insights.
          </p>
          <Button
            onClick={handleOpenPlaid}
            size="lg"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Link className="w-4 h-4" />
            Connect with Plaid
          </Button>
        </div>
      )}

      {/* Connect bank dialog */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Connect Your Bank</DialogTitle>
            <DialogDescription className="text-white/70">
              Select your bank to securely connect your accounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {availableBanks.map(bank => (
              <button
                key={bank.id}
                className={`
                  p-4 rounded-lg flex items-center gap-3 text-left 
                  ${selectedBank === bank.id 
                    ? 'bg-[#88B04B]/20 border border-[#88B04B]/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
                onClick={() => handleConnectBankAccount(bank.id)}
                disabled={isConnecting}
              >
                <img 
                  src={bank.logo} 
                  alt={bank.name}
                  className="w-10 h-10 rounded-md object-contain bg-white p-1"
                />
                <span className="font-medium">{bank.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-white/60 mb-2">Can't find your bank?</p>
            <button
              className="p-3 w-full rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-left flex items-center gap-3"
              onClick={() => alert('This would open a search dialog in a full implementation')}
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </span>
              <span>Search for your bank</span>
            </button>
          </div>
          
          <DialogFooter className="mt-6 flex gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 