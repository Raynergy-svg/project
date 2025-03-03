import React from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';
import { Switch } from '@/components/ui/Switch';

export function MockDataToggle() {
  const { isMockDataEnabled, toggleMockData } = useBankConnection();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
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