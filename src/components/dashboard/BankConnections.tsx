import { memo } from 'react';
import { PlusCircle, Building2, ChevronRight } from 'lucide-react';
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
        <div className="text-center p-10 bg-black/30 rounded-xl">
          <Building2 className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No banks connected</h3>
          <p className="text-white/60 mb-6">Connect your banks to automatically track your finances</p>
          <Button onClick={onAddConnection} className="bg-white/10 hover:bg-white/20 text-white">
            <PlusCircle className="w-4 h-4 mr-2" /> Connect Bank
          </Button>
        </div>
      )}
    </div>
  );
});

// Add default export for lazy loading
export default BankConnections; 