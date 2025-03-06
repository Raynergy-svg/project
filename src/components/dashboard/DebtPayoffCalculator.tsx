import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingDown, ArrowRight, Check, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  totalInterestPaid: number;
}

interface PaymentStrategy {
  name: string;
  description: string;
  totalMonths: number;
  totalInterest: number;
  monthlyPayment: number;
  schedule: PaymentScheduleItem[];
}

const DebtPayoffCalculator: React.FC = () => {
  const { dashboardState } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [extraPayment, setExtraPayment] = useState(100);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [results, setResults] = useState<{
    monthsToPayoff: number;
    interestSaved: number;
    newPayoffDate: Date;
  } | null>(null);
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: '1', name: 'Credit Card', balance: 5000, interestRate: 18.99, minimumPayment: 150 },
    { id: '2', name: 'Student Loan', balance: 25000, interestRate: 4.5, minimumPayment: 250 },
    { id: '3', name: 'Car Loan', balance: 15000, interestRate: 6.9, minimumPayment: 350 },
  ]);
  
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [activeStrategy, setActiveStrategy] = useState<'avalanche' | 'snowball' | 'highinterest' | 'custom'>('avalanche');
  const [strategies, setStrategies] = useState<Record<string, PaymentStrategy>>({});
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [includeVisualizations, setIncludeVisualizations] = useState<boolean>(true);
  const [isEditingDebts, setIsEditingDebts] = useState<boolean>(false);
  const [newDebt, setNewDebt] = useState<Omit<DebtItem, 'id'>>({
    name: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
  });

  // Calculate the results when the user changes the extra payment amount
  const calculateResults = () => {
    setIsLoading(true);
    
    // Simulate API call or calculation
    setTimeout(() => {
      // In a real app, this would be a more complex calculation based on interest rates
      const totalDebt = dashboardState.totalDebt;
      const avgInterestRate = dashboardState.debtBreakdown.reduce(
        (sum, debt) => sum + debt.interestRate * debt.amount, 
        0
      ) / totalDebt;
      
      // Simple calculation for demo purposes
      const standardMonthlyPayment = dashboardState.monthlyPayment;
      const enhancedMonthlyPayment = standardMonthlyPayment + extraPayment;
      
      // Calculate months to payoff (simplified)
      const standardMonths = Math.ceil(totalDebt / standardMonthlyPayment);
      const enhancedMonths = Math.ceil(totalDebt / enhancedMonthlyPayment);
      const monthsSaved = standardMonths - enhancedMonths;
      
      // Calculate interest saved (simplified)
      const interestSaved = totalDebt * (avgInterestRate / 12) * monthsSaved;
      
      // Calculate new payoff date
      const newPayoffDate = new Date();
      newPayoffDate.setMonth(newPayoffDate.getMonth() + enhancedMonths);
      
      setResults({
        monthsToPayoff: enhancedMonths,
        interestSaved,
        newPayoffDate
      });
      
      setIsLoading(false);
    }, 1000);
  };

  // Calculate total debt when debts change
  useEffect(() => {
    const total = debts.reduce((sum, debt) => sum + debt.balance, 0);
    setTotalDebt(total);
  }, [debts]);

  // Calculate payment strategies when debts or extra payment changes
  useEffect(() => {
    calculateStrategies();
  }, [debts, extraPayment]);

  const calculateStrategies = () => {
    if (debts.length === 0) return;
    
    setIsCalculating(true);
    
    // Calculate basic metrics
    const minimumPaymentTotal = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const totalMonthlyPayment = minimumPaymentTotal + extraPayment;
    
    // Clone debts for different sorting strategies
    const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const highInterestDebts = [...debts].filter(d => d.interestRate > 10)
      .sort((a, b) => b.interestRate - a.interestRate)
      .concat([...debts].filter(d => d.interestRate <= 10)
      .sort((a, b) => b.interestRate - a.interestRate));
    
    // Calculate payoff for each strategy
    const avalancheStrategy = calculatePayoffStrategy(avalancheDebts, totalMonthlyPayment);
    const snowballStrategy = calculatePayoffStrategy(snowballDebts, totalMonthlyPayment);
    const highInterestStrategy = calculatePayoffStrategy(highInterestDebts, totalMonthlyPayment);
    
    setStrategies({
      avalanche: {
        name: 'Avalanche Method',
        description: 'Pay highest interest debts first to minimize interest payments',
        totalMonths: avalancheStrategy.months,
        totalInterest: avalancheStrategy.totalInterest,
        monthlyPayment: totalMonthlyPayment,
        schedule: avalancheStrategy.schedule
      },
      snowball: {
        name: 'Snowball Method',
        description: 'Pay smallest debts first for psychological wins',
        totalMonths: snowballStrategy.months,
        totalInterest: snowballStrategy.totalInterest,
        monthlyPayment: totalMonthlyPayment,
        schedule: snowballStrategy.schedule
      },
      highinterest: {
        name: 'High Interest Focus',
        description: 'Prioritize debts above 10% interest, then move to lower rates',
        totalMonths: highInterestStrategy.months, 
        totalInterest: highInterestStrategy.totalInterest,
        monthlyPayment: totalMonthlyPayment,
        schedule: highInterestStrategy.schedule
      }
    });
    
    setIsCalculating(false);
  };

  const calculatePayoffStrategy = (sortedDebts: DebtItem[], totalMonthlyPayment: number) => {
    let remainingDebts = [...sortedDebts].map(debt => ({
      ...debt,
      remainingBalance: debt.balance
    }));
    
    let month = 0;
    let totalInterest = 0;
    const schedule: PaymentScheduleItem[] = [];
    
    while (remainingDebts.length > 0) {
      month++;
      let monthlyPaymentRemaining = totalMonthlyPayment;
      let monthlyPrincipal = 0;
      let monthlyInterest = 0;
      let totalRemainingBalance = 0;
      
      // Calculate interest and make minimum payments
      for (let i = 0; i < remainingDebts.length; i++) {
        const debt = remainingDebts[i];
        const monthlyInterestAmount = debt.remainingBalance * (debt.interestRate / 100 / 12);
        let monthlyPayment = Math.min(debt.minimumPayment, debt.remainingBalance + monthlyInterestAmount);
        
        if (monthlyPaymentRemaining >= monthlyPayment) {
          monthlyPaymentRemaining -= monthlyPayment;
        } else {
          monthlyPayment = monthlyPaymentRemaining;
          monthlyPaymentRemaining = 0;
        }
        
        const principalPayment = Math.max(0, monthlyPayment - monthlyInterestAmount);
        const interestPayment = monthlyPayment - principalPayment;
        
        monthlyPrincipal += principalPayment;
        monthlyInterest += interestPayment;
        totalInterest += interestPayment;
        
        debt.remainingBalance = Math.max(0, debt.remainingBalance - principalPayment);
        totalRemainingBalance += debt.remainingBalance;
      }
      
      // Apply extra payment to first debt
      if (monthlyPaymentRemaining > 0 && remainingDebts.length > 0) {
        const firstDebt = remainingDebts[0];
        const principalPayment = Math.min(firstDebt.remainingBalance, monthlyPaymentRemaining);
        firstDebt.remainingBalance -= principalPayment;
        monthlyPrincipal += principalPayment;
        totalRemainingBalance = remainingDebts.reduce((sum, debt) => sum + debt.remainingBalance, 0);
      }
      
      // Remove paid off debts
      remainingDebts = remainingDebts.filter(debt => debt.remainingBalance > 0);
      
      // Add to payment schedule
      schedule.push({
        month,
        payment: monthlyPrincipal + monthlyInterest,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        remainingBalance: totalRemainingBalance,
        totalInterestPaid: totalInterest
      });
      
      // Safety check
      if (month > 600) break; // 50 years max
    }
    
    return {
      months: month,
      totalInterest,
      schedule
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const formatDate = (monthsFromNow: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handleAddDebt = () => {
    if (newDebt.name && newDebt.balance > 0 && newDebt.interestRate > 0 && newDebt.minimumPayment > 0) {
      setDebts([...debts, { 
        id: Date.now().toString(), 
        ...newDebt 
      }]);
      
      setNewDebt({
        name: '',
        balance: 0,
        interestRate: 0,
        minimumPayment: 0
      });
    }
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const handleExtraPaymentChange = (value: number[]) => {
    setExtraPayment(value[0]);
  };

  const handlePrintSchedule = () => {
    const strategy = strategies[activeStrategy];
    if (!strategy) return;
    
    // Create a print-friendly window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Debt Payoff Schedule - ${strategy.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Debt Payoff Schedule</h1>
          <div class="summary">
            <h2>${strategy.name}</h2>
            <p>${strategy.description}</p>
            <p><strong>Total Debt:</strong> ${formatCurrency(totalDebt)}</p>
            <p><strong>Monthly Payment:</strong> ${formatCurrency(strategy.monthlyPayment)}</p>
            <p><strong>Payoff Time:</strong> ${strategy.totalMonths} months (${Math.floor(strategy.totalMonths / 12)} years and ${strategy.totalMonths % 12} months)</p>
            <p><strong>Total Interest Paid:</strong> ${formatCurrency(strategy.totalInterest)}</p>
            <p><strong>Debt Free Date:</strong> ${formatDate(strategy.totalMonths)}</p>
          </div>
          
          <h2>Your Debts</h2>
          <table>
            <thead>
              <tr>
                <th>Debt</th>
                <th>Balance</th>
                <th>Interest Rate</th>
                <th>Minimum Payment</th>
              </tr>
            </thead>
            <tbody>
              ${debts.map(debt => `
                <tr>
                  <td>${debt.name}</td>
                  <td>${formatCurrency(debt.balance)}</td>
                  <td>${formatPercentage(debt.interestRate)}</td>
                  <td>${formatCurrency(debt.minimumPayment)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Payment Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              ${strategy.schedule.map(month => `
                <tr>
                  <td>${month.month}</td>
                  <td>${formatDate(month.month)}</td>
                  <td>${formatCurrency(month.payment)}</td>
                  <td>${formatCurrency(month.principal)}</td>
                  <td>${formatCurrency(month.interest)}</td>
                  <td>${formatCurrency(month.remainingBalance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <button onclick="window.print()">Print This Schedule</button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const getChartData = () => {
    if (!strategies[activeStrategy]) return [];
    
    // Sample the data to avoid too many points on chart
    const schedule = strategies[activeStrategy].schedule;
    const sampleInterval = Math.max(1, Math.floor(schedule.length / 24));
    
    return schedule
      .filter((_, index) => index % sampleInterval === 0 || index === schedule.length - 1)
      .map(item => ({
        month: item.month,
        balance: item.remainingBalance,
        interest: item.totalInterestPaid
      }));
  };

  const currentStrategy = strategies[activeStrategy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2A2A2A] rounded-xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-[#88B04B]" />
          Debt Payoff Calculator
        </h2>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="include-viz" className="text-sm text-white/70">
            Include Charts
          </Label>
          <Switch
            id="include-viz" 
            checked={includeVisualizations}
            onCheckedChange={setIncludeVisualizations}
            className="data-[state=checked]:bg-[#88B04B]"
          />
          
          <Button
            size="sm"
            variant="outline"
            className="ml-2 text-white border-white/20 hover:bg-white/10"
            onClick={() => setIsEditingDebts(!isEditingDebts)}
          >
            {isEditingDebts ? 'Done Editing' : 'Edit Debts'}
          </Button>
        </div>
      </div>

      {/* Debt List and Editor */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Your Debts</h3>
        <div className="bg-black/20 rounded-lg p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Min. Payment</TableHead>
                {isEditingDebts && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium text-white">{debt.name}</TableCell>
                  <TableCell>{formatCurrency(debt.balance)}</TableCell>
                  <TableCell>{formatPercentage(debt.interestRate)}</TableCell>
                  <TableCell>{formatCurrency(debt.minimumPayment)}</TableCell>
                  {isEditingDebts && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleRemoveDebt(debt.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              
              {isEditingDebts && (
                <TableRow>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Debt name"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                      className="bg-black/30 border-white/20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Balance"
                      value={newDebt.balance || ''}
                      onChange={(e) => setNewDebt({...newDebt, balance: parseFloat(e.target.value) || 0})}
                      className="bg-black/30 border-white/20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Interest %"
                      value={newDebt.interestRate || ''}
                      onChange={(e) => setNewDebt({...newDebt, interestRate: parseFloat(e.target.value) || 0})}
                      className="bg-black/30 border-white/20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Min payment"
                      value={newDebt.minimumPayment || ''}
                      onChange={(e) => setNewDebt({...newDebt, minimumPayment: parseFloat(e.target.value) || 0})}
                      className="bg-black/30 border-white/20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={handleAddDebt}
                      disabled={!newDebt.name || newDebt.balance <= 0 || newDebt.interestRate <= 0 || newDebt.minimumPayment <= 0}
                      className="bg-[#88B04B] hover:bg-[#88B04B]/90"
                      size="sm"
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Extra Payment Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-lg font-medium text-white">Extra Monthly Payment</Label>
          <span className="text-lg font-medium text-[#88B04B]">{formatCurrency(extraPayment)}</span>
        </div>
        <div className="px-2">
          <Slider
            defaultValue={[extraPayment]}
            max={1000}
            step={10}
            onValueChange={handleExtraPaymentChange}
            className="my-5"
          />
          <div className="flex justify-between text-xs text-white/60">
            <span>$0</span>
            <span>$250</span>
            <span>$500</span>
            <span>$750</span>
            <span>$1,000</span>
          </div>
        </div>
      </div>

      {/* Payoff Strategies */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Payoff Strategy</h3>
        <Tabs defaultValue="avalanche" value={activeStrategy} onValueChange={(value) => setActiveStrategy(value as any)}>
          <TabsList className="mb-6 bg-black/20 p-1 rounded-lg grid grid-cols-3 w-full">
            <TabsTrigger value="avalanche" className="data-[state=active]:bg-[#88B04B] data-[state=active]:text-white">
              Avalanche
            </TabsTrigger>
            <TabsTrigger value="snowball" className="data-[state=active]:bg-[#88B04B] data-[state=active]:text-white">
              Snowball
            </TabsTrigger>
            <TabsTrigger value="highinterest" className="data-[state=active]:bg-[#88B04B] data-[state=active]:text-white">
              High Interest
            </TabsTrigger>
          </TabsList>

          {Object.keys(strategies).map((key) => (
            <TabsContent key={key} value={key} className="mt-0">
              {currentStrategy && (
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">{currentStrategy.name}</h4>
                      <p className="text-white/70 text-sm mb-4">{currentStrategy.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Total Debt</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(totalDebt)}</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Monthly Payment</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(currentStrategy.monthlyPayment)}</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Payoff Time</p>
                          <p className="text-xl font-bold text-white">
                            {Math.floor(currentStrategy.totalMonths / 12)}y {currentStrategy.totalMonths % 12}m
                          </p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Interest Paid</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(currentStrategy.totalInterest)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-[#88B04B]/10 p-3 rounded-lg border border-[#88B04B]/30">
                        <p className="text-white font-medium flex items-center">
                          <Check className="text-[#88B04B] w-4 h-4 mr-2" />
                          Debt-free Date
                        </p>
                        <p className="text-lg font-bold text-white mt-1">
                          {formatDate(currentStrategy.totalMonths)}
                        </p>
                      </div>
                    </div>
                    
                    {includeVisualizations && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getChartData()}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fill: '#ccc' }}
                              label={{ value: 'Months', position: 'insideBottom', fill: '#ccc' }} 
                            />
                            <YAxis 
                              tick={{ fill: '#ccc' }}
                              width={80}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              labelFormatter={(value) => `Month ${value}`}
                              contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              name="Balance" 
                              stroke="#88B04B" 
                              strokeWidth={2}
                              dot={false} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="interest" 
                              name="Interest Paid" 
                              stroke="#FF6B6B" 
                              strokeWidth={2}
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white/20 hover:bg-white/10"
                      onClick={() => calculateStrategies()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recalculate
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white/20 hover:bg-white/10"
                      onClick={handlePrintSchedule}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Print Schedule
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Analysis and Recommendations */}
      <div className="bg-black/20 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-[#88B04B]" />
          Analysis & Recommendations
        </h3>
        
        {currentStrategy && (
          <>
            <p className="text-white/70 mb-4">
              Based on your debt profile and selected strategy, here are our recommendations:
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                </div>
                <span className="text-white/80">
                  {extraPayment > 0 
                    ? `Adding ${formatCurrency(extraPayment)} extra monthly will save you ${formatCurrency(totalDebt * 0.2)} in interest.`
                    : 'Adding extra payments would significantly reduce your total interest paid.'}
                </span>
              </li>
              
              {debts.some(d => d.interestRate > 15) && (
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                  </div>
                  <span className="text-white/80">
                    Consider balance transfer options for your high-interest debts (over 15%).
                  </span>
                </li>
              )}
              
              {totalDebt > 0 && (
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#88B04B]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#88B04B]"></div>
                  </div>
                  <span className="text-white/80">
                    {activeStrategy === 'avalanche'
                      ? 'The Avalanche method will save you the most in interest payments.'
                      : activeStrategy === 'snowball'
                        ? 'The Snowball method provides psychological wins but may cost more in interest.'
                        : 'Focusing on high-interest debt first is a good compromise strategy.'}
                  </span>
                </li>
              )}
            </ul>
            
            <Button className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 mt-4">
              Create Personalized Debt Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DebtPayoffCalculator; 