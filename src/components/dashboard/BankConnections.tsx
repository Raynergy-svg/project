import { memo } from 'react';
import { PlusCircle, Building2, ChevronRight, Lock, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface BankConnection {
  id: string;
  name: string;
  logoUrl?: string;
  lastSynced?: Date;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  accountCount: number;
}

export interface BankConnectionsProps {
  connections: BankConnection[];
  onAddConnection: () => void;
  onViewConnection: (connectionId: string) => void;
}

export const BankConnections = memo(function BankConnections({ 
  connections = [], 
  onAddConnection, 
  onViewConnection 
}: BankConnectionsProps) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Bank Connections</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-white border-white/20 hover:bg-white/10"
          onClick={onAddConnection}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Bank
        </Button>
      </div>
      
      {connections.length > 0 ? (
        <div className="space-y-3">
          {connections.map((connection) => (
            <div 
              key={connection.id}
              className="p-4 bg-black/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-black/40 transition-colors"
              onClick={() => onViewConnection(connection.id)}
            >
              <div className="flex items-center">
                {connection.logoUrl ? (
                  <img 
                    src={connection.logoUrl} 
                    alt={connection.name} 
                    className="w-8 h-8 mr-3 rounded"
                  />
                ) : (
                  <div className="w-8 h-8 mr-3 rounded bg-white/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white/70" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-white">{connection.name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge className={`
                      ${connection.status === 'connected' ? 'bg-green-500/20 text-green-400' : 
                        connection.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        connection.status === 'syncing' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'}
                      text-xs
                    `}>
                      {connection.status === 'connected' ? 'Connected' : 
                       connection.status === 'error' ? 'Error' :
                       connection.status === 'syncing' ? 'Syncing' :
                       'Disconnected'}
                    </Badge>
                    
                    {connection.lastSynced && (
                      <span className="text-xs text-white/50 ml-3">
                        Last synced {connection.lastSynced.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-white/60 mr-3">
                  {connection.accountCount} {connection.accountCount === 1 ? 'account' : 'accounts'}
                </span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-gradient-to-b from-black/40 to-black/20 rounded-xl border border-white/5">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#88B04B]/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#88B04B]" />
          </div>
          
          <h3 className="text-xl font-medium text-white mb-3">No bank accounts connected</h3>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Connect your bank accounts to automatically sync your financial data and get personalized insights
          </p>
          
          <div className="grid gap-4 mb-8 max-w-lg mx-auto">
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-shrink-0 mt-1">
                <Shield className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Bank-level security</h4>
                <p className="text-xs text-white/70 mt-0.5">
                  Your data is protected with 256-bit encryption, the same level of security that banks use
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-shrink-0 mt-1">
                <Lock className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Read-only access</h4>
                <p className="text-xs text-white/70 mt-0.5">
                  We can only view your account information, never make transactions or changes
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="w-5 h-5 text-[#88B04B]" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">You're in control</h4>
                <p className="text-xs text-white/70 mt-0.5">
                  Easily disconnect your accounts at any time with a single click
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={onAddConnection} className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-6 py-6 h-auto font-medium">
            <PlusCircle className="w-5 h-5 mr-2" /> Connect Your Bank Accounts
          </Button>
          
          <p className="text-white/50 text-xs mt-6">
            We use Plaid to securely connect to over 10,000 financial institutions
          </p>
        </div>
      )}
    </div>
  );
});

// Add default export for lazy loading
export default BankConnections; 