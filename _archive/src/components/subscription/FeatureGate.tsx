import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGateProps {
  children: ReactNode;
  isPremium: boolean;
  isTrialing: boolean;
  onUpgrade: () => void;
  feature: string;
}

export function FeatureGate({ 
  children, 
  isPremium, 
  isTrialing, 
  onUpgrade, 
  feature 
}: FeatureGateProps) {
  if (isPremium || isTrialing) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="text-center p-6">
          <Lock className="w-12 h-12 text-[#88B04B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Premium Feature
          </h3>
          <p className="text-white/80 mb-4">
            Upgrade to access {feature} and other premium features
          </p>
          <Button
            onClick={onUpgrade}
            className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
      <div className="opacity-20 pointer-events-none">
        {children}
      </div>
    </div>
  );
}