import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FileText,
  CreditCard, 
  CalendarClock 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/_skeleton-compat';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';

interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'student_loan' | 'mortgage' | 'medical' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  status: 'active' | 'paid' | 'deferred';
  accountNumber: string;
  lender: string;
}

export default function DebtsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [filteredDebts, setFilteredDebts] = useState<Debt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Debt>('balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Fetch debts
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockDebts: Debt[] = [
          {
            id: '1',
            name: 'Credit Card A',
            type: 'credit_card',
            balance: 5420.32,
            interestRate: 0.1799,
            minimumPayment: 150.00,
            dueDate: '2023-06-15',
            status: 'active',
            accountNumber: '****1234',
            lender: 'Chase'
          },
          {
            id: '2',
            name: 'Student Loan',
            type: 'student_loan',
            balance: 12500.00,
            interestRate: 0.0465,
            minimumPayment: 180.25,
            dueDate: '2023-06-01',
            status: 'active',
            accountNumber: 'SL123456',
            lender: 'Great Lakes'
          },
          {
            id: '3',
            name: 'Car Loan',
            type: 'loan',
            balance: 8235.41,
            interestRate: 0.0399,
            minimumPayment: 320.00,
            dueDate: '2023-06-10',
            status: 'active',
            accountNumber: 'CL987654',
            lender: 'Capital One Auto'
          },
          {
            id: '4',
            name: 'Medical Bill',
            type: 'medical',
            balance: 1200.00,
            interestRate: 0.0,
            minimumPayment: 100.00,
            dueDate: '2023-07-01',
            status: 'active',
            accountNumber: 'MB123987',
            lender: 'City Hospital'
          },
          {
            id: '5',
            name: 'Personal Loan',
            type: 'loan',
            balance: 2500.00,
            interestRate: 0.0899,
            minimumPayment: 125.00,
            dueDate: '2023-06-05',
            status: 'active',
            accountNumber: 'PL567890',
            lender: 'SoFi'
          }
        ];
        
        setDebts(mockDebts);
        setFilteredDebts(mockDebts);
      } catch (error) {
        console.error('Failed to fetch debts:', error);
        toast({
          title: 'Error fetching debts',
          description: 'There was a problem loading your debts. Please try again.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDebts();
  }, [toast]);
  
  // Handle filtering and sorting
  useEffect(() => {
    let result = [...debts];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(debt => debt.type === typeFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(debt => 
        debt.name.toLowerCase().includes(query) || 
        debt.lender.toLowerCase().includes(query) ||
        debt.accountNumber.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      } else {
        // Numeric sort
        const numA = Number(fieldA);
        const numB = Number(fieldB);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
    });
    
    setFilteredDebts(result);
  }, [debts, searchQuery, typeFilter, sortField, sortDirection]);
  
  // Handle sort toggle
  const toggleSort = (field: keyof Debt) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending on new field
    }
  };
  
  // Get debt type badge
  const getDebtTypeBadge = (type: string) => {
    switch (type) {
      case 'credit_card':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CreditCard className="h-3 w-3 mr-1" />
            Credit Card
          </Badge>
        );
      case 'loan':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <FileText className="h-3 w-3 mr-1" />
            Loan
          </Badge>
        );
      case 'student_loan':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <FileText className="h-3 w-3 mr-1" />
            Student Loan
          </Badge>
        );
      case 'mortgage':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <FileText className="h-3 w-3 mr-1" />
            Mortgage
          </Badge>
        );
      case 'medical':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <FileText className="h-3 w-3 mr-1" />
            Medical
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <FileText className="h-3 w-3 mr-1" />
            Other
          </Badge>
        );
    }
  };
  
  // Get total debt summary
  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.balance, 0);
  };
  
  const getTotalMinimumPayment = () => {
    return debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  };
  
  const getAverageInterestRate = () => {
    if (debts.length === 0) return 0;
    const totalBalance = getTotalDebt();
    const weightedInterest = debts.reduce(
      (sum, debt) => sum + (debt.balance / totalBalance) * debt.interestRate,
      0
    );
    return weightedInterest;
  };
  
  // Delete debt handler
  const handleDeleteDebt = async (id: string) => {
    // In real implementation, this would call an API
    try {
      toast({
        title: 'Confirm deletion',
        description: 'Are you sure you want to delete this debt?',
        type: 'warning',
        action: (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
              // Delete debt logic
              setDebts(prev => prev.filter(debt => debt.id !== id));
              toast({
                title: 'Debt deleted',
                description: 'The debt has been successfully deleted.',
                type: 'success'
              });
            }}
          >
            Delete
          </Button>
        )
      });
    } catch (error) {
      console.error('Failed to delete debt:', error);
      toast({
        title: 'Error deleting debt',
        description: 'There was a problem deleting this debt.',
        type: 'error'
      });
    }
  };
  
  return (
    <DashboardLayout title="Your Debts" description="Manage and review all your debt accounts in one place.">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <CardDescription>Sum of all active debts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(getTotalDebt())}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <CardDescription>Total minimum payments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(getTotalMinimumPayment())}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
            <CardDescription>Weighted by balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">{formatPercentage(getAverageInterestRate())}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search debts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="student_loan">Student Loan</SelectItem>
              <SelectItem value="mortgage">Mortgage</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => router.push('/dashboard/debts/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Debt
        </Button>
      </div>
      
      {/* Debts table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
          <CardDescription>
            Manage all your debts in one place. Click on a debt to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredDebts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('balance')}
                    >
                      <div className="flex items-center">
                        Balance
                        {sortField === 'balance' && (
                          <ArrowUpDown 
                            className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('interestRate')}
                    >
                      <div className="flex items-center">
                        Interest Rate
                        {sortField === 'interestRate' && (
                          <ArrowUpDown 
                            className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('dueDate')}
                    >
                      <div className="flex items-center">
                        Due Date
                        {sortField === 'dueDate' && (
                          <ArrowUpDown 
                            className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/debts/${debt.id}`)}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{debt.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-2">
                            <span>{debt.lender}</span>
                            <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                            <span>{debt.accountNumber}</span>
                          </div>
                          <div className="mt-1">
                            {getDebtTypeBadge(debt.type)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(debt.balance)}</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatPercentage(debt.interestRate)}</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatCurrency(debt.minimumPayment)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(debt.dueDate, 'en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/debts/${debt.id}`)}>
                                <FileText className="h-4 w-4 mr-2" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/debts/${debt.id}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => handleDeleteDebt(debt.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all'
                  ? 'No debts match your search criteria'
                  : 'You haven\'t added any debts yet'}
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={() => router.push('/dashboard/debts/add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Debt
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real implementation, this would verify authentication
  // We'll handle auth in the component for now
  return {
    props: {},
  };
} 