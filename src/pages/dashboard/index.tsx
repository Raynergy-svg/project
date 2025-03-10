import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Plus,
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-adapter';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/formatters';

// Mock data structure for the dashboard
interface DebtSummary {
  totalDebt: number;
  totalInterest: number;
  monthlyPayment: number;
  remainingMonths: number;
  debtReductionLastMonth: number;
  interestPaidLastMonth: number;
  debtCount: number;
}

interface RecentPayment {
  id: string;
  date: string;
  amount: number;
  accountName: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UpcomingPayment {
  id: string;
  dueDate: string;
  amount: number;
  accountName: string;
  isPriority: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, these would be API calls to fetch data
        // For now, we'll simulate with setTimeout and mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setDebtSummary({
          totalDebt: 25750.45,
          totalInterest: 4328.12,
          monthlyPayment: 842.35,
          remainingMonths: 36,
          debtReductionLastMonth: 712.89,
          interestPaidLastMonth: 129.46,
          debtCount: 4
        });
        
        setRecentPayments([
          {
            id: '1',
            date: '2023-05-15',
            amount: 450.00,
            accountName: 'Credit Card A',
            status: 'completed'
          },
          {
            id: '2',
            date: '2023-05-10',
            amount: 250.00,
            accountName: 'Personal Loan',
            status: 'completed'
          },
          {
            id: '3',
            date: '2023-05-05',
            amount: 142.35,
            accountName: 'Credit Card B',
            status: 'completed'
          }
        ]);
        
        setUpcomingPayments([
          {
            id: '1',
            dueDate: '2023-06-01',
            amount: 450.00,
            accountName: 'Credit Card A',
            isPriority: true
          },
          {
            id: '2',
            dueDate: '2023-06-10',
            amount: 250.00,
            accountName: 'Personal Loan',
            isPriority: false
          },
          {
            id: '3',
            dueDate: '2023-06-15',
            amount: 142.35,
            accountName: 'Credit Card B',
            isPriority: false
          }
        ]);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get days until due
  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Payment status badge
  const PaymentStatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100 dark:bg-green-900/20';
        textColor = 'text-green-700 dark:text-green-400';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 dark:bg-yellow-900/20';
        textColor = 'text-yellow-700 dark:text-yellow-400';
        break;
      case 'failed':
        bgColor = 'bg-red-100 dark:bg-red-900/20';
        textColor = 'text-red-700 dark:text-red-400';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-800';
        textColor = 'text-gray-700 dark:text-gray-400';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <DashboardLayout title="Dashboard" description="Overview of your debt management progress.">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}. Here's your financial overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/debts/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Debt
          </Link>
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Debt */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(debtSummary?.totalDebt || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                <>
                  <span className="text-green-500 inline-flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {formatCurrency(debtSummary?.debtReductionLastMonth || 0)}
                  </span>{' '}
                  from last month
                </>
              )}
            </p>
          </CardContent>
        </Card>
        
        {/* Monthly Payment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(debtSummary?.monthlyPayment || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                <>
                  {debtSummary?.remainingMonths || 0} months remaining
                </>
              )}
            </p>
          </CardContent>
        </Card>
        
        {/* Interest Paid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(debtSummary?.totalInterest || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                <>
                  <span className="text-red-500 inline-flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {formatCurrency(debtSummary?.interestPaidLastMonth || 0)}
                  </span>{' '}
                  last month
                </>
              )}
            </p>
          </CardContent>
        </Card>
        
        {/* Active Debts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Debts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {debtSummary?.debtCount || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                <>
                  <Link href="/dashboard/debts" className="text-primary hover:underline">
                    View all debts
                  </Link>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Payments */}
      <Tabs defaultValue="upcoming" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="recent">Recent Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Payments scheduled for the next 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          payment.isPriority 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.accountName}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {formatDate(payment.dueDate)}
                            {getDaysUntilDue(payment.dueDate) <= 3 && (
                              <span className="ml-2 text-red-500 font-medium">
                                ({getDaysUntilDue(payment.dueDate)} days left)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                        <Link 
                          href={`/dashboard/payments/${payment.id}`}
                          className="text-sm text-primary flex items-center hover:underline"
                        >
                          Details <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming payments found.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Schedule Payment</Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/payments">View All Payments</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Your payment history for the last 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-muted text-muted-foreground">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.accountName}</p>
                          <p className="text-sm text-muted-foreground">
                            Paid on {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent payments found.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/payments/history">
                  View Payment History
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Freedom Progress</CardTitle>
          <CardDescription>
            Track your journey to becoming debt-free.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-xs text-muted-foreground">Current Progress</span>
                  <p className="font-medium">{user?.debtProgress || 0}%</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Debt-free by</span>
                  <p className="font-medium">June 2026</p>
                </div>
              </div>
              
              <div className="w-full h-3 bg-muted rounded-full mb-6">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${user?.debtProgress || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between gap-4">
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-1">Debt Snowball Strategy</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Focus on smallest debts first for psychological wins.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/strategies/snowball">Apply Strategy</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-1">Debt Avalanche Strategy</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pay off highest interest debts first to minimize cost.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/strategies/avalanche">Apply Strategy</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This function would normally verify authentication
  // For now, we'll handle auth in the component
  return {
    props: {},
  };
} 