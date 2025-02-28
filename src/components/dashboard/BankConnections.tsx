import { motion } from 'framer-motion';
import { Building2, Plus, RefreshCcw, XCircle, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBankConnection } from '@/hooks/useBankConnection';
import { formatCurrency } from '@/lib/utils';

export function BankConnections() {
  const {
    accounts,
    isLoading,
    error,
    openBankConnection,
    refreshAccounts,
    disconnectAccount
  } = useBankConnection();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Connected Accounts</h2>
          <p className="text-white/60">Manage your financial accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refreshAccounts()}
            disabled={isLoading}
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={openBankConnection}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-[#88B04B]/20">
                  <Building2 className="w-5 h-5 text-[#88B04B]" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{account.name}</h3>
                  <p className="text-sm text-white/60">
                    {account.institution} •••• {account.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium text-white">
                  {formatCurrency(account.balance)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => disconnectAccount(account.id)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No accounts connected
            </h3>
            <p className="text-white/60 mb-4">
              Connect your bank accounts to get personalized insights
            </p>
            <Button onClick={openBankConnection}>
              Connect Your First Account
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8 text-white/60">
            Loading accounts...
          </div>
        )}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-[#88B04B]" />
          <h3 className="font-medium text-white">Bank-Level Security</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>SOC2 Type II certified</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 