import { useState } from 'react';
import { PieChart, Cell, ResponsiveContainer, Pie, Tooltip, Legend } from 'recharts';
import { DollarSign, ArrowRight, TrendingUp, TrendingDown, Filter, ShoppingBag, Home, Car, Coffee, Utensils, Gift, CreditCard, Plane, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data - in a real app, this would come from props or an API
const sampleTransactionData = [
  { id: 1, date: '2023-06-15', name: 'Grocery Store', category: 'Groceries', amount: 78.35, account: 'Bank of America' },
  { id: 2, date: '2023-06-14', name: 'Amazon', category: 'Shopping', amount: 54.99, account: 'Chase Credit' },
  { id: 3, date: '2023-06-13', name: 'Gas Station', category: 'Transportation', amount: 45.20, account: 'Wells Fargo' },
  { id: 4, date: '2023-06-12', name: 'Netflix', category: 'Entertainment', amount: 14.99, account: 'Bank of America' },
  { id: 5, date: '2023-06-11', name: 'Starbucks', category: 'Food & Dining', amount: 6.75, account: 'Chase Credit' },
  { id: 6, date: '2023-06-10', name: 'Rent Payment', category: 'Housing', amount: 1500.00, account: 'Bank of America' },
  { id: 7, date: '2023-06-09', name: 'Mobile Phone', category: 'Bills', amount: 85.00, account: 'Wells Fargo' },
];

const spendingByCategory = [
  { name: 'Housing', value: 1650, color: '#FF8042' },
  { name: 'Food & Dining', value: 480, color: '#00C49F' },
  { name: 'Transportation', value: 320, color: '#FFBB28' },
  { name: 'Entertainment', value: 180, color: '#0088FE' },
  { name: 'Shopping', value: 250, color: '#8884d8' },
  { name: 'Bills & Utilities', value: 420, color: '#FF5294' },
  { name: 'Health', value: 140, color: '#4BC0C0' },
  { name: 'Travel', value: 120, color: '#A28AFA' },
];

const monthlyIncome = [
  { source: 'Primary Job', amount: 4200 },
  { source: 'Side Hustle', amount: 800 },
  { source: 'Investments', amount: 350 },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Housing': <Home className="w-4 h-4" />,
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Entertainment': <Smartphone className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Bills & Utilities': <CreditCard className="w-4 h-4" />,
  'Health': <Coffee className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
  'Gifts': <Gift className="w-4 h-4" />,
  'Other': <DollarSign className="w-4 h-4" />,
};

export interface AccountOverviewProps {
  className?: string;
}

export function AccountOverview({ className }: AccountOverviewProps) {
  const [activeTab, setActiveTab] = useState('spending');
  const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = spendingByCategory.reduce((sum, item) => sum + item.value, 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 rounded-md border border-white/10 text-xs">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-[#88B04B]">${payload[0].value.toLocaleString()}</p>
          <p className="text-white/60">{Math.round(payload[0].value / totalExpenses * 100)}% of spending</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-sm shadow-sm ${className}`}>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#88B04B]/20 border border-[#88B04B]/30">
              <DollarSign className="w-4 h-4 text-[#88B04B]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Account Overview</h2>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-5">
            <TabsTrigger value="spending" className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]">
              Spending
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]">
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-[#88B04B]/20 data-[state=active]:text-[#88B04B]">
              Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="spending" className="mt-0">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Spending by Category</h3>
                  <Badge className="bg-white/10 text-white/70">Last 30 days</Badge>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-white/60">Total Monthly Spending</p>
                  <p className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Top Spending Categories</h3>
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2 bg-white/5 text-white/70 border-white/10">
                    <Filter className="w-3 h-3" /> Filter
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {spendingByCategory.sort((a, b) => b.value - a.value).slice(0, 6).map((category, index) => (
                    <div key={index} className="flex items-center p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        {categoryIcons[category.name] || <DollarSign className="w-4 h-4" style={{ color: category.color }} />}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm text-white font-medium">{category.name}</p>
                          <p className="text-sm text-white font-medium">${category.value.toLocaleString()}</p>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-1">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(category.value / totalExpenses * 100, 100)}%`,
                              backgroundColor: category.color 
                            }} 
                          />
                        </div>
                        <p className="text-xs text-white/60 mt-1">{Math.round(category.value / totalExpenses * 100)}% of total spending</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4">
                  <p className="text-xs text-white/60">Average Daily Spend</p>
                  <p className="text-xs font-medium text-white">${Math.round(totalExpenses / 30).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cashflow" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-white/60">Monthly Income</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline">
                    <CardTitle className="text-2xl text-white">${totalIncome.toLocaleString()}</CardTitle>
                    <span className="ml-2 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3 inline mr-0.5" />
                      +5.2%
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-white/60">Monthly Expenses</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline">
                    <CardTitle className="text-2xl text-white">${totalExpenses.toLocaleString()}</CardTitle>
                    <span className="ml-2 text-xs text-red-400">
                      <TrendingDown className="w-3 h-3 inline mr-0.5" />
                      -2.1%
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-white/60">Net Cash Flow</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline">
                    <CardTitle className="text-2xl text-white">${netCashFlow.toLocaleString()}</CardTitle>
                    <Badge className="ml-2 bg-[#88B04B]/20 text-[#88B04B]">
                      Positive
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Income Sources</h3>
                <div className="space-y-3">
                  {monthlyIncome.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm text-white">{source.source}</p>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-white">${source.amount.toLocaleString()}</p>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#88B04B]/10 text-[#88B04B]">
                          {Math.round(source.amount / totalIncome * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Top Expense Categories</h3>
                <div className="space-y-3">
                  {spendingByCategory.sort((a, b) => b.value - a.value).slice(0, 3).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-lg mr-2" style={{ backgroundColor: `${category.color}20` }}>
                          {categoryIcons[category.name] || <DollarSign className="w-3.5 h-3.5" style={{ color: category.color }} />}
                        </div>
                        <p className="text-sm text-white">{category.name}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-white">${category.value.toLocaleString()}</p>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {Math.round(category.value / totalExpenses * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <div className="p-3 rounded-lg bg-[#88B04B]/10 border border-[#88B04B]/20">
                    <div className="flex items-start">
                      <DollarSign className="w-4 h-4 text-[#88B04B] mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-white">Savings Rate</p>
                        <p className="text-xs text-white/70">You're saving {Math.round(netCashFlow / totalIncome * 100)}% of your income</p>
                        {netCashFlow / totalIncome < 0.2 ? (
                          <p className="text-xs text-[#88B04B] mt-1">Try to increase your savings rate to at least 20% for better financial health</p>
                        ) : (
                          <p className="text-xs text-[#88B04B] mt-1">Great job! You're above the recommended 20% savings rate</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Recent Transactions</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-white/70">Last 7 days</Badge>
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2 bg-white/5 text-white/70 border-white/10">
                  <Filter className="w-3 h-3" /> Filter
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-lg border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70">Merchant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70">Account</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/70">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTransactionData.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm text-white/80">{formatDate(transaction.date)}</td>
                        <td className="px-4 py-3 text-sm text-white">{transaction.name}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-white/10 text-white/80 font-normal">
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">{transaction.account}</td>
                        <td className="px-4 py-3 text-sm text-white text-right font-medium">
                          ${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" className="gap-1 bg-white/5 text-white hover:bg-white/10 border-white/20">
                View All Transactions <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 