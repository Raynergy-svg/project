import React from 'react';
import { DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderSectionProps {
  title: string;
  icon?: React.ReactNode;
  connectedAccountsCount?: number;
  actionButton?: React.ReactNode;
  className?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  icon = <DollarSign className="w-4 h-4 text-[#88B04B]" />,
  connectedAccountsCount,
  actionButton,
  className = '',
}) => {
  return (
    <div className={`p-5 border-b border-white/10 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {connectedAccountsCount !== undefined && (
            <Badge 
              className="bg-white/10 text-white/70"
              title="Number of connected bank accounts"
            >
              Connected to {connectedAccountsCount} bank account{connectedAccountsCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection; 