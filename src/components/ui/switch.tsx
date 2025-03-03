import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, labelClassName = "", disabled = false }: SwitchProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-60' : ''}`}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={onChange}
        disabled={disabled}
      />
      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#88B04B]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#88B04B]"></div>
      <span className={`ml-3 ${labelClassName}`}>{label}</span>
    </label>
  );
}

export default Switch; 