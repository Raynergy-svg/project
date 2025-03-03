import React from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';
import { Switch } from '@/components/ui/Switch';

export function MockDataToggle() {
  // Check if this is a production environment - if so, don't render anything
  const isProduction = process.env.NODE_ENV === 'production';
  
  // If we're in production, don't render the toggle at all
  if (isProduction) {
    return null;
  }
  
  const { isMockDataEnabled, toggleMockData } = useBankConnection();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent enabling mock data in production as an additional safeguard
    if (isProduction) {
      console.warn('Mock data cannot be enabled in production');
      return;
    }
    toggleMockData(e.target.checked);
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-white">Mock Bank Data</span>
          <span className="text-sm text-gray-400">
            {isMockDataEnabled 
              ? "Using mock bank data for development" 
              : "Using real bank API (may fail if not configured)"}
          </span>
          <span className="text-xs text-yellow-500 mt-1 font-semibold">
            DEVELOPMENT USE ONLY - Never enable in production
          </span>
        </div>
        <Switch 
          checked={isMockDataEnabled} 
          onChange={handleToggle} 
          label="Enable Mock Data" 
          labelClassName="sr-only"
        />
      </div>
    </div>
  );
}

export default MockDataToggle; 