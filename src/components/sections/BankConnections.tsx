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
  Trash2
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
    if (!isPlaidReady) {
      console.log('Plaid not ready yet');
      return;
    }
    
    openBankConnection();
    setShowConnectModal(true);
  }, [isPlaidReady, openBankConnection]);
  
  // Config for the Plaid Link component
  const config: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess: (public_token, metadata) => {
      console.log('Success!', public_token, metadata);
      
      // In a real app, you would exchange this token for an access token on your backend
      // For our demo, we'll simulate connecting a bank account
      if (metadata.institution && metadata.accounts && metadata.accounts.length > 0) {
        const account = metadata.accounts[0];
        
        // Connect the account
        connectAccount({
          id: uuidv4(),
          institutionName: metadata.institution.name,
          accountType: account.type,
          accountName: account.name,
          accountNumber: account.mask,
          balance: 1250.00, // Mock balance
          lastUpdated: new Date(),
          status: 'active',
          plaidItemId: metadata.item_id,
          plaidAccountId: account.id,
          institutionId: metadata.institution.institution_id
        });
      }
      
      setShowConnectModal(false);
      setSelectedBank(null);
    },
    onExit: (err, metadata) => {
      console.log('Exit!', err, metadata);
      setShowConnectModal(false);
      setSelectedBank(null);
    },
  };
  
  const { open, ready } = usePlaidLink(config);
  
  // Handle connecting a mock bank account
  const handleConnectBankAccount = (bankId: string) => {
    setSelectedBank(bankId);
    
    // In a real app, we would use Plaid Link here
    // For our mock, we'll add a random account
    const selectedBank = availableBanks.find(bank => bank.id === bankId);
    
    if (!selectedBank) return;
    
    if (ready && linkToken) {
      // Use real Plaid Link if ready
      open();
    } else {
      // Use mock data if Plaid is not set up
      setTimeout(() => {
        const accountTypes = ['checking', 'savings', 'credit'];
        const randomType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        
        connectAccount({
          id: uuidv4(),
          institutionName: selectedBank.name,
          accountType: randomType,
          accountName: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Account`,
          balance: Math.floor(Math.random() * 10000) / 100,
          lastUpdated: new Date(),
          status: 'active'
        });
        
        setShowConnectModal(false);
        setSelectedBank(null);
      }, 1000);
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
        {/* Error message */}
        {error && !initError && (
          <div className="p-6 bg-red-900/30 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="font-medium text-red-300">Connection Error</h4>
                <p className="text-sm text-red-200/80">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleRefreshAccounts} 
              variant="outline" 
              size="sm"
              className="mt-3 ml-8 border-red-500/30 bg-transparent text-red-300 hover:bg-red-900/30"
            >
              Retry Connection
            </Button>
          </div>
        )}
        
        {/* Display connected accounts */}
        {accounts.length > 0 ? (
          <div>
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
          </div>
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
      </CardContent>
      
      {/* Connect bank modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="bg-gray-900 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Connect Your Bank</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select your bank to securely connect your accounts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {availableBanks.map(bank => (
              <button
                key={bank.id}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition",
                  selectedBank === bank.id && "border-blue-500 bg-blue-900/20"
                )}
                onClick={() => handleConnectBankAccount(bank.id)}
              >
                <img 
                  src={bank.logo} 
                  alt={bank.name} 
                  className="w-10 h-10 object-contain bg-white rounded-md p-1"
                  onError={(e) => {
                    // Fallback if logo doesn't load
                    e.currentTarget.src = "https://placehold.co/80x80/1e293b/cbd5e1?text=Bank";
                  }}
                />
                <span className="text-sm font-medium text-gray-200">{bank.name}</span>
              </button>
            ))}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" type="button" className="border-white/10 text-gray-200 hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <p className="text-xs text-gray-400">
              Powered by Plaid
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 