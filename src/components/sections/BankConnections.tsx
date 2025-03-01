import { useState } from 'react';
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
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBankConnection } from '@/hooks/useBankConnection';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';

export function BankConnections() {
  const { user } = useAuth();
  const { 
    accounts, 
    isLoading, 
    error, 
    openBankConnection: connectAccount, 
    disconnectAccount, 
    refreshAccounts 
  } = useBankConnection();
  
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  
  // Mock list of available banks
  const availableBanks = [
    { id: 'chase', name: 'Chase', logo: '🏦', popular: true },
    { id: 'bofa', name: 'Bank of America', logo: '🏦', popular: true },
    { id: 'wells', name: 'Wells Fargo', logo: '🏦', popular: true },
    { id: 'citi', name: 'Citibank', logo: '🏦', popular: true },
    { id: 'capital', name: 'Capital One', logo: '🏦', popular: true },
    { id: 'discover', name: 'Discover', logo: '💳', popular: false },
    { id: 'amex', name: 'American Express', logo: '💳', popular: false },
    { id: 'usbank', name: 'US Bank', logo: '🏦', popular: false },
    { id: 'pnc', name: 'PNC Bank', logo: '🏦', popular: false },
    { id: 'td', name: 'TD Bank', logo: '🏦', popular: false },
  ];
  
  // Handle connecting a bank account
  const handleConnectBankAccount = (bankId: string) => {
    setSelectedBank(bankId);
    
    // In a real app, this would open a secure connection flow
    // For this demo, we'll simulate the connection process
    setTimeout(() => {
      const bank = availableBanks.find(b => b.id === bankId);
      if (bank) {
        connectAccount({
          id: `${bankId}-${Date.now()}`,
          institutionName: bank.name,
          accountType: 'checking',
          accountName: `${bank.name} Checking`,
          balance: Math.floor(Math.random() * 10000),
          lastUpdated: new Date(),
          status: 'active'
        });
      }
      setShowConnectModal(false);
      setSelectedBank(null);
    }, 2000);
  };
  
  // Handle disconnecting a bank account
  const handleDisconnectAccount = (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account? This action cannot be undone.')) {
      disconnectAccount(accountId);
    }
  };
  
  // Handle refreshing account data
  const handleRefreshAccounts = () => {
    refreshAccounts();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Bank Connections</h2>
          <p className="text-white/60">Manage your connected financial accounts</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefreshAccounts}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            className="gap-2"
            onClick={() => setShowConnectModal(true)}
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/20 border border-red-500/30"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-white font-medium">Error connecting to your accounts</p>
          </div>
          <p className="text-white/70 text-sm mt-1 ml-8">
            {error}. Please try again later or contact support if the issue persists.
          </p>
        </motion.div>
      )}
      
      {/* Connected accounts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Connected Accounts</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/70">Loading your accounts...</p>
          </div>
        ) : accounts && accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-blue-500/20 mb-4">
              <Building className="h-6 w-6 text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No accounts connected</h4>
            <p className="text-white/60 max-w-md mb-6">
              Connect your bank accounts to automatically track your finances and get personalized insights.
            </p>
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <motion.div 
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg mr-4 bg-blue-500/20">
                      {account.accountType === 'checking' || account.accountType === 'savings' ? (
                        <Building className="h-5 w-5 text-blue-400" />
                      ) : account.accountType === 'credit' ? (
                        <CreditCard className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Wallet className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{account.accountName}</h4>
                      <p className="text-sm text-white/60">{account.institutionName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-white/50">Balance</p>
                      <p className="font-medium text-white">{formatCurrency(account.balance)}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50">Status</p>
                      <div className="flex items-center">
                        {account.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mr-1" />
                            <span className="text-green-400 text-sm">Active</span>
                          </>
                        ) : account.status === 'pending' ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400 mr-1" />
                            <span className="text-amber-400 text-sm">Pending</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-400 mr-1" />
                            <span className="text-red-400 text-sm">Error</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50">Last Updated</p>
                      <p className="text-sm text-white/70">{formatDate(account.lastUpdated)}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300"
                    onClick={() => handleDisconnectAccount(account.id)}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Security information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Security & Privacy</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <LockKeyhole className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Bank-level security</h4>
              <p className="text-white/70 text-sm">
                We use 256-bit encryption and secure connections to protect your financial data.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Read-only access</h4>
              <p className="text-white/70 text-sm">
                We can only view your transaction data, not move money or make changes to your accounts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">Your data belongs to you</h4>
              <p className="text-white/70 text-sm">
                We never sell your personal information to third parties. You can disconnect your accounts at any time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Connect account modal */}
      {showConnectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Connect a Bank Account</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowConnectModal(false)}
                className="text-white/70 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-white/70 mb-6">
              Select your bank or financial institution to securely connect your accounts.
            </p>
            
            <div className="space-y-2 mb-6">
              <h4 className="text-sm font-medium text-white/70 mb-2">Popular Banks</h4>
              {availableBanks
                .filter(bank => bank.popular)
                .map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => handleConnectBankAccount(bank.id)}
                    disabled={selectedBank === bank.id}
                    className={`w-full flex items-center p-3 rounded-lg border ${
                      selectedBank === bank.id
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-black/30 border-white/10 text-white hover:bg-black/50 hover:border-white/20'
                    } transition-colors`}
                  >
                    <span className="text-xl mr-3">{bank.logo}</span>
                    <span className="font-medium">{bank.name}</span>
                    {selectedBank === bank.id && (
                      <div className="ml-auto flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-blue-400">Connecting...</span>
                      </div>
                    )}
                  </button>
                ))
              }
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/70 mb-2">Other Financial Institutions</h4>
              {availableBanks
                .filter(bank => !bank.popular)
                .map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => handleConnectBankAccount(bank.id)}
                    disabled={selectedBank === bank.id}
                    className={`w-full flex items-center p-3 rounded-lg border ${
                      selectedBank === bank.id
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-black/30 border-white/10 text-white hover:bg-black/50 hover:border-white/20'
                    } transition-colors`}
                  >
                    <span className="text-xl mr-3">{bank.logo}</span>
                    <span className="font-medium">{bank.name}</span>
                    {selectedBank === bank.id && (
                      <div className="ml-auto flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-blue-400">Connecting...</span>
                      </div>
                    )}
                  </button>
                ))
              }
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm text-center">
                By connecting your accounts, you agree to our <a href="#" className="text-blue-400 hover:underline">terms of service</a> and <a href="#" className="text-blue-400 hover:underline">privacy policy</a>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 