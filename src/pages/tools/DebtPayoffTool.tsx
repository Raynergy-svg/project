import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DebtPayoffCalculator from '@/components/dashboard/DebtPayoffCalculator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/empty-module-browser';

export default function DebtPayoffTool() {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4 text-white/70 hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Debt Payoff Calculator
          </h1>
        </div>
        
        <div className="mb-6 bg-black/20 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-3">About This Tool</h2>
          <p className="text-white/70 mb-4">
            This interactive calculator helps you visualize different debt payoff strategies and their impact on your financial future. 
            Compare methods like the debt avalanche (focusing on highest interest rates) or debt snowball 
            (focusing on smallest balances) to find the approach that works best for you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Avalanche Method</h3>
              <p className="text-white/70">
                Pay minimum on all debts, then put extra money toward the debt with the highest interest rate.
                Mathematically optimal for minimizing interest.
              </p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Snowball Method</h3>
              <p className="text-white/70">
                Pay minimum on all debts, then put extra money toward the smallest debt balance.
                Creates psychological wins as debts are eliminated quickly.
              </p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">High Interest Focus</h3>
              <p className="text-white/70">
                Prioritize debts with interest rates above 10%, then work on lower-interest debts.
                A balanced approach for most situations.
              </p>
            </div>
          </div>
        </div>
        
        <DebtPayoffCalculator />
      </div>
    </DashboardLayout>
  );
} 