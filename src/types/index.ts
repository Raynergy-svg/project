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