import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { BankConnection } from '@/lib/dashboardConstants';
import { CreditCard, Plus, RefreshCw, Link, ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface BankConnectionsProps {
  connections: BankConnection[];
  isLoading?: boolean;
  onAddConnection: () => void;
  onRefreshConnections: () => void;
  onManageConnection: (connectionId: string) => void;
}

export const BankConnections = memo(function BankConnections({
  connections = [],
  isLoading = false,
  onAddConnection,
  onRefreshConnections,
  onManageConnection
}: BankConnectionsProps) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white">Bank Connections</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            onClick={onRefreshConnections}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            onClick={onAddConnection}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="bg-black/20 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
          <Link className="w-10 h-10 text-white/30 mb-4" />
          <p className="text-white/60 mb-4">Connect your financial accounts to automatically track your debts and payments</p>
          <Button 
            onClick={onAddConnection}
            className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <div 
              key={connection.id}
              className="bg-black/20 rounded-xl p-5 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => onManageConnection(connection.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#88B04B]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{connection.institutionName}</h3>
                    <p className="text-sm text-white/60">
                      {connection.accountCount} account{connection.accountCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className="text-sm text-white/60">Last updated</p>
                    <p className="text-sm text-white/80 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" /> 
                      {formatDistanceToNow(new Date(connection.lastSynced), { addSuffix: true })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#88B04B]" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline"
            className="w-full py-6 border-dashed border-white/20 text-white/70 hover:bg-white/5 flex items-center justify-center"
            onClick={onAddConnection}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Connection
          </Button>
        </div>
      )}
    </div>
  );
});

// Add default export for lazy loading
export default BankConnections; 