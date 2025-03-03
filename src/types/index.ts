export interface User {
  id: string;
  email: string;
  emailIv?: string;
  name?: string;
  nameIv?: string;
  isPremium: boolean;
  trialEndsAt: string | null;
  createdAt: string;
}

export interface SignUpData {
  email: string;
  name: string;
  password: string;
  subscriptionId?: string;
}

export interface Budget {
  id: string;
  userId: string;
  monthlyIncome: number;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export interface Debt {
  id: string;
  userId: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'other';
  amount: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTier {
  name: 'Free' | 'Premium';
  price: number;
  features: string[];
  isPopular?: boolean;
}

// Component Props Interfaces
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export interface FeatureGateProps {
  children: React.ReactNode;
  isPremium: boolean;
  isTrialing: boolean;
  onUpgrade: () => void;
  feature: string;
}

export interface LoadingStateProps {
  width?: string;
  height?: string;
  className?: string;
}

export interface ProgressBarProps {
  progress: number;
  label: string;
  color?: string;
  className?: string;
}

export interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export interface DebtOverviewProps {
  debts: Debt[];
  isLoading?: boolean;
  onDebtUpdate?: (debt: Debt) => void;
}

export interface BudgetAnalyzerProps {
  budget: Budget;
  isEditable?: boolean;
  onUpdateBudget: (budget: Budget) => void;
}

export interface PricingPlansProps {
  onSelectPlan: (plan: SubscriptionTier) => void;
  currentPlan?: 'Free' | 'Premium';
  isLoading?: boolean;
}

export interface SubscriptionManagerProps {
  currentPlan: SubscriptionTier['name'];
  nextBillingDate?: string;
  onCancelSubscription: () => void;
  onUpdatePayment: () => void;
  isProcessing?: boolean;
}

export interface PaymentMethodFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export interface DataExportProps {
  data: {
    transactions: any[];
    budgets: any[];
    goals: any[];
  };
  onExport: (format: 'csv' | 'json') => Promise<void>;
  isExporting?: boolean;
}

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface FeaturePanelProps {
  title: string;
  icon: React.ReactNode;
  sections: {
    title: string;
    content: string;
  }[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

// Re-export types from other files
export * from './user';
export * from './auth';

// Add bank account related types
export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'mortgage';
  balance: number;
  availableBalance?: number;
  currency: string;
  lastUpdated: Date;
  institution: {
    id: string;
    name: string;
    logo?: string;
  };
}

// Add transaction related types
export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  isIncome: boolean;
  pending: boolean;
  merchantName?: string;
  merchantLogo?: string;
}

// Add account type
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

// Interface for the dashboard data structure
export interface DashboardData {
  profile: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  } | null;
  accounts: BankAccount[];
  transactions: Transaction[];
  isConnected: boolean;
}

// Legacy dashboard state interface for backward compatibility
export interface DebtInfo {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  remainingPayments?: number;
  type: 'credit_card' | 'student_loan' | 'mortgage' | 'auto_loan' | 'personal_loan' | 'medical' | 'other';
  lender: string;
  dueDate?: string;
  paymentFrequency?: 'monthly' | 'biweekly' | 'weekly';
  additionalPayment?: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  limit: number;
  color: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  categories: {
    name: string;
    amount: number;
  }[];
}

export interface PaymentHistory {
  date: string;
  amount: number;
  debtId: string;
  debtName: string;
}

export interface Projection {
  date: string;
  amount: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  impact: number;
  saving?: number;
  action?: string;
  type: 'tip' | 'warning' | 'optimization';
  applied?: boolean;
}

export interface DashboardState {
  totalDebt: number;
  monthlyPayment: number;
  interestPaid: number;
  debtFreeDate: string;
  monthlyChange: number;
  debtToIncomeRatio: number;
  aiOptimizationScore: number;
  debtBreakdown: DebtInfo[];
  savingsOpportunities: number;
  paymentHistory: PaymentHistory[];
  projectedPayoff: Projection[];
  insights: Insight[];
  isAIEnabled: boolean;
  budgetCategories: BudgetCategory[];
  monthlySpending: MonthlySpending[];
  monthlyIncome: number;
  creditScore: number;
  totalBudget: number;
  totalSpent: number;
  isConnectingBank: boolean;
  bankConnectionError: string | null;
  connectedAccounts: BankAccount[];
  isConnected?: boolean;
}