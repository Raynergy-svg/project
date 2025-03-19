"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CircleDollarSign, ArrowUpRight, CreditCard, BarChart3, TrendingUp, Wallet, FileText, ArrowDown, ArrowUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const COLORS = ['#88B04B', '#6E8CD5', '#F8C630', '#FA8072', '#34BFA3'];

export default function Dashboard() {
  // This would typically come from an API/database
  const [accountsData, setAccountsData] = useState([
    { name: 'Checking', value: 4500, change: 2.3, type: 'bank' },
    { name: 'Savings', value: 12500, change: 1.8, type: 'bank' },
    { name: 'Investment', value: 28500, change: -3.2, type: 'investment' },
    { name: 'Credit Card', value: -2800, change: -12.5, type: 'debt' },
  ]);

  const [debtsData, setDebtsData] = useState([
    { name: 'Mortgage', value: 285000, rate: 4.2, payment: 1450, type: 'mortgage' },
    { name: 'Auto Loan', value: 18500, rate: 3.8, payment: 320, type: 'auto' },
    { name: 'Student Loan', value: 34000, rate: 5.2, payment: 410, type: 'student' },
    { name: 'Credit Card', value: 2800, rate: 19.99, payment: 120, type: 'credit' },
  ]);

  // Calculate total assets and liabilities
  const totalAssets = accountsData
    .filter(account => account.value > 0)
    .reduce((sum, account) => sum + account.value, 0);
    
  const totalLiabilities = accountsData
    .filter(account => account.value < 0)
    .reduce((sum, account) => sum + Math.abs(account.value), 0) + 
    debtsData.reduce((sum, debt) => sum + debt.value, 0);
    
  const netWorth = totalAssets - totalLiabilities;

  // Monthly payment data
  const monthlyPaymentsData = [
    { name: 'Jan', amount: 2100 },
    { name: 'Feb', amount: 2200 },
    { name: 'Mar', amount: 2050 },
    { name: 'Apr', amount: 2300 },
    { name: 'May', amount: 2250 },
    { name: 'Jun', amount: 2400 },
  ];

  // Debt distribution data
  const debtDistribution = debtsData.map(debt => ({
    name: debt.name,
    value: debt.value
  }));

  // Recent transactions
  const recentTransactions = [
    { id: 1, description: 'Mortgage Payment', amount: -1450, date: '2023-06-01', category: 'Housing' },
    { id: 2, description: 'Paycheck Deposit', amount: 3200, date: '2023-06-01', category: 'Income' },
    { id: 3, description: 'Grocery Store', amount: -128.42, date: '2023-05-28', category: 'Food' },
    { id: 4, description: 'Gas Station', amount: -45.67, date: '2023-05-27', category: 'Transportation' },
    { id: 5, description: 'Online Shopping', amount: -78.99, date: '2023-05-25', category: 'Shopping' },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button size="sm">
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${netWorth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {netWorth > 0 ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />}
              </span>
              <p className="text-xs text-muted-foreground">
                Total Assets: {formatCurrency(totalAssets)} | Total Debt: {formatCurrency(totalLiabilities)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Debt Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(debtsData.reduce((sum, debt) => sum + debt.payment, 0))}</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-500">
                <ArrowDown className="inline h-3 w-3" />
              </span>
              <p className="text-xs text-muted-foreground">-2.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-[#88B04B]" style={{ width: '36%' }}></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Estimated debt-free date: June 2028</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountsData.map((account, index) => (
              <Card key={index} className={`${account.value < 0 ? 'border-red-200' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{account.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {account.type === 'bank' ? 'Bank Account' : 
                     account.type === 'investment' ? 'Investment Account' : 'Debt Account'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {formatCurrency(account.value)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${account.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {account.change >= 0 ? 
                        <ArrowUp className="inline h-3 w-3" /> : 
                        <ArrowDown className="inline h-3 w-3" />}
                      {Math.abs(account.change)}%
                    </span>
                    <p className="text-xs text-muted-foreground">from last month</p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-xs">
                    View Details
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="debts">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Debt Overview</CardTitle>
                <CardDescription>Breakdown of your current debt accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debtsData.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{debt.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {debt.rate}% interest • ${debt.payment}/mo
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(debt.value)}</div>
                        <Link href={`/dashboard/debts/${debt.name.toLowerCase().replace(' ', '-')}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Details <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Debt Distribution</CardTitle>
                <CardDescription>By outstanding balance</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debtDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {debtDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payoff Strategy</CardTitle>
                <CardDescription>Recommended approach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Current Strategy: Debt Avalanche</h4>
                    <p className="text-sm text-muted-foreground">
                      Paying off debts with the highest interest rate first
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Payoff Order:</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                      <li>Credit Card (19.99%)</li>
                      <li>Student Loan (5.2%)</li>
                      <li>Mortgage (4.2%)</li>
                      <li>Auto Loan (3.8%)</li>
                    </ol>
                  </div>
                  
                  <div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Payoff Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Payments</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPaymentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#88B04B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date} • {transaction.category}
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : ''}`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your financial profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <h4 className="font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
                    Opportunity Alert
                  </h4>
                  <p className="text-sm mt-1">
                    Refinancing your auto loan could save you approximately $850 over the loan term. Current rates are about 1.2% lower than your existing rate.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">Explore Refinancing</Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>
                    Success Milestone
                  </h4>
                  <p className="text-sm mt-1">
                    You've paid off 15% of your total debt since joining Smart Debt Flow. At this rate, you'll be debt-free 2 years earlier than initially projected.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"></path><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"></path></svg>
                    Educational Tip
                  </h4>
                  <p className="text-sm mt-1">
                    Creating a dedicated emergency fund can prevent future debt. Our analysis suggests aiming for $9,800 (3 months of expenses) in an easy-to-access account.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">Learn More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
