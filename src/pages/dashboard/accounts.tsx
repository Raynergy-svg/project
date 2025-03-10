import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, CreditCard, Trash2, ExternalLink, RefreshCw, AlertCircle, Building } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/Skeleton';

interface Account {
  id: string;
  account_name: string;
  account_type: string;
  institution: string;
  current_balance: number;
  last_updated: string;
  is_connected: boolean;
}

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    institution: '',
    current_balance: 0
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch accounts from API
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/accounts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      
      const data = await response.json();
      setAccounts(data);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message || 'An error occurred while fetching accounts');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current_balance' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle account type select change
  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      account_type: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }
      
      const newAccount = await response.json();
      
      // Add the new account to state
      setAccounts(prev => [...prev, newAccount]);
      
      // Reset form and close dialog
      setFormData({
        account_name: '',
        account_type: 'checking',
        institution: '',
        current_balance: 0
      });
      setIsAddingAccount(false);
      
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'An error occurred while creating the account');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      // Remove the account from state
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'An error occurred while deleting the account');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get total balance
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.current_balance, 0);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Bank Accounts | Smart Debt Flow</title>
        <meta name="description" content="Manage your bank accounts" />
      </Head>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bank Accounts</h1>
            <p className="text-muted-foreground">
              Manage your connected bank accounts and track your balances
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAccounts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddingAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Accounts summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
              ) : (
                <div className="text-3xl font-bold">{formatCurrency(getTotalBalance())}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{accounts.length}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connected Banks</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">
                  {new Set(accounts.map(a => a.institution)).size}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-base">
                  {accounts.length > 0 
                    ? new Date(Math.max(...accounts.map(a => new Date(a.last_updated).getTime()))).toLocaleDateString() 
                    : 'No accounts'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accounts list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Accounts</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-card rounded-lg p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Bank Accounts Found</h3>
              <p className="text-muted-foreground mb-4">
                Connect your bank accounts to track your balances and transactions
              </p>
              <Button onClick={() => setIsAddingAccount(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(account => (
                <Card key={account.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                      {account.account_name}
                    </CardTitle>
                    <CardDescription>
                      {account.institution} • {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {formatCurrency(account.current_balance)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(account.last_updated).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    {account.is_connected && (
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Account</DialogTitle>
            <DialogDescription>
              Add a bank account to track your balances and transactions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    name="account_name"
                    placeholder="e.g., Personal Checking"
                    value={formData.account_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={handleAccountTypeChange}
                  >
                    <SelectTrigger id="account_type">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input
                  id="institution"
                  name="institution"
                  placeholder="e.g., Chase Bank"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current_balance">Current Balance</Label>
                <Input
                  id="current_balance"
                  name="current_balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.current_balance}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingAccount(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Server-side props for authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return context.req.cookies[name];
        },
        set(name, value, options) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
        remove(name, options) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: `/signin?redirect=${encodeURIComponent('/dashboard/accounts')}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      initialSession: session,
    },
  };
} 