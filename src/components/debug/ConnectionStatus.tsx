import { useEffect, useState } from 'react';
import { checkSupabaseConnection, formatConnectionStatus } from '@/utils/supabase/connectionStatus';
import { Button } from '@/components/ui/button';

export function ConnectionStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const status = await checkSupabaseConnection();
      setStatusMessage(formatConnectionStatus(status));
    } catch (err) {
      setStatusMessage(`Error checking connection: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-black/20 backdrop-blur-sm hover:bg-black/40"
        >
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg bg-black/80 backdrop-blur-sm border border-gray-700 text-white max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Supabase Connection Status</h3>
        <Button 
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white"
        >
          Close
        </Button>
      </div>
      
      <div className="space-y-2">
        {isChecking ? (
          <p>Checking connection...</p>
        ) : (
          <pre className="text-xs whitespace-pre-wrap bg-black/50 p-2 rounded font-mono overflow-auto max-h-60">
            {statusMessage || 'Click "Check Connection" to test Supabase connection'}
          </pre>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Connection'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
} 