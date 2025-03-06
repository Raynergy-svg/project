import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function DataFreshnessIndicator({ 
  lastUpdated, 
  onRefresh, 
  className = '' 
}: DataFreshnessIndicatorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Calculate time ago string
  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdated.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) {
        setTimeAgo(`${diffSec} seconds ago`);
      } else if (diffSec < 3600) {
        const minutes = Math.floor(diffSec / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(diffSec / 86400);
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 10000); // Update every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  // Handle auto-refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh) {
      intervalId = setInterval(async () => {
        await handleRefresh();
      }, 60000); // Auto-refresh every minute
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-between rounded-lg bg-black/20 p-3 ${className}`}
    >
      <div className="flex items-center text-sm text-white/70">
        <Clock className="h-4 w-4 mr-2 text-[#88B04B]" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>Last updated: <span className="font-medium text-white">{timeAgo}</span></span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Full timestamp: {lastUpdated.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            className="data-[state=checked]:bg-[#88B04B]"
          />
          <Label htmlFor="auto-refresh" className="text-sm font-medium text-white">
            Auto-refresh
          </Label>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </motion.div>
  );
}

export default DataFreshnessIndicator; 