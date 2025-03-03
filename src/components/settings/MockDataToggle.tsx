import React from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';

// Simple Switch component for this component only
interface SimpleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelClassName?: string;
}

const SimpleSwitch: React.FC<SimpleSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  labelClassName 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        {label && (
          <span className={`text-sm font-medium leading-none ml-2 ${labelClassName || ''}`}>
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

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
        <SimpleSwitch 
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