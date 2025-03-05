import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createBankAccountsTable } from '@/lib/supabase/createBankAccountsTable';
import type { DebtInfo as Debt, BudgetCategory, MonthlySpending } from '@/services/financialAnalysis';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Skeleton, SkeletonCardGrid } from '@/components/ui/Skeleton';
import { LazyLoad } from '@/components/ui/LazyLoad';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Lucide icons
import { 
  RefreshCw, 
  Shield, 
  CreditCard, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown, 
  Pencil, 
  User, 
  Lock, 
  Mail, 
  Key, 
  LogIn, 
  LogOut, 
  Smartphone, 
  Laptop, 
  Moon, 
  Share2, 
  Settings2, 
  BellRing 
} from 'lucide-react';

// Lazy loaded components for better performance
const OverviewCards = lazy(() => import('@/components/dashboard/OverviewCards'));
const DebtBreakdown = lazy(() => import('@/components/dashboard/DebtBreakdown'));
const NextPayment = lazy(() => import('@/components/dashboard/NextPayment'));
const BankConnections = lazy(() => import('@/components/dashboard/BankConnections'));
const DebtProjection = lazy(() => import('@/components/dashboard/DebtProjection'));
const FinancialTools = lazy(() => import('@/components/dashboard/FinancialTools'));
const LoadingSpinner = lazy(() => import('@/components/ui/LoadingSpinner').then(module => ({ default: module.LoadingSpinner })));

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Skeleton for top cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton variant="card" className="h-52" />
      <Skeleton variant="card" className="h-52" />
      <Skeleton variant="card" className="h-52" />
    </div>
    
    {/* Skeleton for main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton variant="card" className="h-96" />
      <Skeleton variant="card" className="h-96" />
    </div>
  </div>
);

// Subscription summary component with consistent styling
const SubscriptionSummary = ({ currentPlan, nextBillingDate }: { currentPlan: string, nextBillingDate?: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'history' | 'payment'>('features');
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [billingHistory, setBillingHistory] = useState<Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    invoice_url?: string;
  }>>([]);

  useEffect(() => {
    // Simulate loading billing history
    const fetchBillingHistory = async () => {
      setIsLoadingBilling(true);
      try {
        // This would be an API call in production
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for now - would come from an API
        setBillingHistory([
          {
            id: 'inv_123456',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: currentPlan === 'pro' ? 50.00 : 20.00,
            status: 'paid',
            invoice_url: '#'
          },
          {
            id: 'inv_123455',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            amount: currentPlan === 'pro' ? 50.00 : 20.00,
            status: 'paid',
            invoice_url: '#'
          },
          {
            id: 'inv_123454',
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            amount: currentPlan === 'pro' ? 50.00 : 20.00,
            status: 'paid',
            invoice_url: '#'
          }
        ]);
      } catch (error) {
        console.error('Error fetching billing history:', error);
      } finally {
        setIsLoadingBilling(false);
      }
    };
    
    if (showDetails && activeTab === 'history') {
      fetchBillingHistory();
    }
  }, [showDetails, activeTab, currentPlan]);

  // Plan features based on subscription tier
  const planFeatures = {
    'basic': {
      title: 'Basic Plan',
      price: '$20/month',
      features: [
      "Basic debt calculator",
      "Single debt strategy",
      "Monthly payment tracking",
      "Basic spending insights",
        "Limited AI Tokens (100/mo)",
        "Standard support",
        "1 connected bank account",
        "Monthly financial reports"
      ]
    },
    'pro': {
      title: 'Pro Plan',
      price: '$50/month',
      features: [
      "Advanced debt calculator",
      "All debt strategies",
      "Real-time payment tracking",
      "Deep financial insights",
        "Unlimited AI Tokens",
        "Priority support",
        "Unlimited bank connections",
        "Weekly financial reports",
        "Custom budget categories",
        "Investment tracking",
        "Credit score monitoring",
        "Tax document preparation"
      ]
    }
  };
  
  const handleCancelSubscription = () => {
    // In a real app, this would call an API to cancel the subscription
    console.log('Cancelling subscription');
    setShowCancelConfirm(false);
  };
  
  const handleUpdatePayment = () => {
    // In a real app, this would open a payment update modal or redirect to payment page
    window.location.href = '/settings?tab=payment';
  };

  const handleUpgradeDowngrade = () => {
    window.location.href = '/pricing?from=dashboard';
  };

  // Current payment method - this would come from an API call in production
  const paymentMethod = {
    type: 'credit_card',
    last4: '4242',
    expiry: '12/25',
    brand: 'Visa'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2A2A2A] rounded-xl border border-white/10 p-6 mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Your Subscription</h3>
        <div className="flex items-center gap-2 text-[#88B04B]">
          <Shield className="w-5 h-5" />
          <span>Active</span>
        </div>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <p className="text-white/80 mb-1">Current Plan</p>
          <div className="flex items-center gap-2">
          <p className="text-white font-semibold text-lg">
            {currentPlan === 'pro' ? 'Pro' : 'Basic'} Plan
          </p>
            <span className="text-sm text-white/60">
              {currentPlan === 'pro' ? '$50/month' : '$20/month'}
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="text-[#88B04B] border-[#88B04B]/30 hover:bg-[#88B04B]/10"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'} {showDetails ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
        </Button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10 mt-4">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'features' 
                ? 'text-white border-b-2 border-[#88B04B]' 
                : 'text-white/60 hover:text-white'}`}
            >
              Plan Features
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'history' 
                ? 'text-white border-b-2 border-[#88B04B]' 
                : 'text-white/60 hover:text-white'}`}
            >
              Billing History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'payment' 
                ? 'text-white border-b-2 border-[#88B04B]' 
                : 'text-white/60 hover:text-white'}`}
            >
              Payment Method
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="py-4">
            {/* Plan Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <span className="mr-2">{planFeatures[currentPlan as keyof typeof planFeatures].title}</span>
                    <span className="text-sm text-white/60">{planFeatures[currentPlan as keyof typeof planFeatures].price}</span>
                  </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {planFeatures[currentPlan as keyof typeof planFeatures]?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#88B04B]" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={handleUpgradeDowngrade}
                    className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-black"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            )}
            
            {/* Billing History Tab */}
            {activeTab === 'history' && (
              <div>
                {isLoadingBilling ? (
                  <div className="space-y-3 py-2">
                    <Skeleton variant="text" className="h-6 w-full" />
                    <Skeleton variant="text" className="h-6 w-full" />
                    <Skeleton variant="text" className="h-6 w-full" />
                </div>
                ) : billingHistory.length > 0 ? (
                  <div className="overflow-hidden rounded-lg">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="py-2 px-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-2 px-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {billingHistory.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 text-sm text-white/80">
                              {new Date(invoice.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-white/80">
                              ${invoice.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {invoice.invoice_url && (
                                <a 
                                  href={invoice.invoice_url} 
                                  className="text-[#88B04B] hover:underline flex items-center justify-end"
                                >
                                  <span>View</span>
                                  <ExternalLink className="ml-1 w-3 h-3" />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
              </div>
                ) : (
                  <p className="text-white/60 text-center py-4">
                    No billing history available.
                  </p>
                )}
                
                <div className="mt-4 text-right">
              <Button 
                variant="link" 
                size="sm" 
                className="text-[#88B04B] h-auto p-0"
              >
                    Download All Invoices <ExternalLink className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </div>
            )}
            
            {/* Payment Method Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Current Payment Method</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-white/60" />
                      <div>
                        <p className="text-white font-medium">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
                        <p className="text-white/60 text-sm">Expires {paymentMethod.expiry}</p>
                      </div>
                    </div>
              <Button
                variant="outline"
                      size="sm"
                onClick={handleUpdatePayment}
                      className="text-[#88B04B] border-[#88B04B]/30 hover:bg-[#88B04B]/10"
              >
                      Update
              </Button>
                  </div>
            </div>
            
                <div className="pt-4 border-t border-white/10">
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Cancel Subscription
              </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Cancellation Confirmation */}
      {showCancelConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 rounded-lg p-4 mt-4"
              >
                <p className="text-white mb-4">
                  Are you sure you want to cancel your subscription? 
                  You'll lose access to all premium features at the end of your current billing period.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={handleCancelSubscription}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Yes, Cancel
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                  >
                    Keep My Plan
                  </Button>
                </div>
              </motion.div>
            )}

      <div className="flex items-center gap-3 text-white/80 mt-4">
        <Calendar className="w-5 h-5" />
        <span>Next billing date: {nextBillingDate || 'N/A'}</span>
          </div>
        </motion.div>
  );
};

// User Account Section component
const UserAccountSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'personal', // 'personal' or 'business'
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    preferences: {
      darkMode: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      dataSharing: false
    }
  });

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the user profile
    console.log('Saving user profile', userData);
    setShowAccountModal(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserData({
        ...userData,
        [parent]: {
          ...userData[parent as keyof typeof userData],
          [child]: value
        }
      });
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };
  
  const handleTogglePreference = (preference: keyof typeof userData.preferences) => {
    setUserData({
      ...userData,
      preferences: {
        ...userData.preferences,
        [preference]: !userData.preferences[preference]
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">Account</h3>
        
        <Button
          variant="outline" 
          className="border-white/20 text-white/80 hover:bg-white/10"
          onClick={() => navigate('/settings')}
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={userData.avatarUrl} 
              alt={userData.firstName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-[#88B04B]" 
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#2A2A2A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{userData.firstName} {userData.lastName}</h3>
            <p className="text-white/60">{userData.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-[#88B04B]/20 text-[#88B04B] hover:bg-[#88B04B]/30 transition-colors">
                {userData.role}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 self-end md:self-auto">
          {showAccountModal ? (
            <>
              <Button
                onClick={() => setShowAccountModal(false)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                size="sm"
                className="bg-[#88B04B] hover:bg-[#88B04B]/90 text-black"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowAccountModal(true)}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      
      {/* Profile Completeness */}
      <div className="mb-6 bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-white font-medium">Profile Completeness</h4>
          <span className="text-white/80 text-sm font-medium">75%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#88B04B]/80 to-[#88B04B] h-2 rounded-full"
            style={{ width: '75%' }}
          />
        </div>
        <p className="mt-2 text-sm text-white/60">
          Complete your profile to unlock all features and improve your experience.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setShowAccountModal(true)}
          className={`px-4 py-2 font-medium text-sm ${showAccountModal ? 'text-white border-b-2 border-[#88B04B]' : 'text-white/60 hover:text-white'}`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setShowAccountModal(true)}
          className={`px-4 py-2 font-medium text-sm ${showAccountModal ? 'text-white border-b-2 border-[#88B04B]' : 'text-white/60 hover:text-white'}`}
        >
          Security & Activity
        </button>
        <button
          onClick={() => setShowAccountModal(true)}
          className={`px-4 py-2 font-medium text-sm ${showAccountModal ? 'text-white border-b-2 border-[#88B04B]' : 'text-white/60 hover:text-white'}`}
        >
          Preferences
        </button>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Personal Info Tab */}
        {showAccountModal && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50 disabled:opacity-60"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-white/80 mb-1">Account Type</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={userData.role}
                    disabled={true}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Security Tab */}
        {showAccountModal && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Password & Authentication</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/80 hover:bg-white/10"
                  onClick={() => navigate('/settings/security')}
                >
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/60" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Switch
                  checked={userData.preferences.twoFactorEnabled}
                  onCheckedChange={() => handleTogglePreference('twoFactorEnabled')}
                  className={`${userData.preferences.twoFactorEnabled ? 'bg-[#88B04B]' : 'bg-white/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span className={`${userData.preferences.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </Switch>
              </div>
              
              <div className="mt-4">
                <h5 className="text-white font-medium mb-3">Recent Activity</h5>
                <div className="space-y-2">
                  {/* Add recent activity component here */}
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <Button
                  variant="link"
                  size="sm"
                  className="text-[#88B04B] h-auto p-0"
                  onClick={() => navigate('/settings/activity')}
                >
                  View All Activity <ExternalLink className="ml-1 w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Active Sessions</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full">
                      <Smartphone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Current Device</p>
                      <p className="text-xs text-white/60">San Francisco, CA • Chrome • Last active now</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Current</Badge>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full">
                      <Laptop className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">MacBook Pro</p>
                      <p className="text-xs text-white/60">New York, NY • Firefox • Last active 2 days ago</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-white/20 text-white/60 hover:bg-white/10"
                  >
                    Logout
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout from All Devices
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Preferences Tab */}
        {showAccountModal && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-white/60">Receive updates, reports, and alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={userData.preferences.emailNotifications}
                    onCheckedChange={() => handleTogglePreference('emailNotifications')}
                    className={`${userData.preferences.emailNotifications ? 'bg-[#88B04B]' : 'bg-white/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${userData.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </Switch>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white">In-App Notifications</p>
                      <p className="text-sm text-white/60">Receive alerts and updates within the app</p>
                    </div>
                  </div>
                  <Switch
                    checked={userData.preferences.pushNotifications}
                    onCheckedChange={() => handleTogglePreference('pushNotifications')}
                    className={`${userData.preferences.pushNotifications ? 'bg-[#88B04B]' : 'bg-white/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${userData.preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </Switch>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">App Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white">Dark Mode</p>
                      <p className="text-sm text-white/60">Toggle between light and dark theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={userData.preferences.darkMode}
                    onCheckedChange={() => handleTogglePreference('darkMode')}
                    className={`${userData.preferences.darkMode ? 'bg-[#88B04B]' : 'bg-white/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${userData.preferences.darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </Switch>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white">Data Sharing</p>
                      <p className="text-sm text-white/60">Share anonymous usage data to help improve our service</p>
                    </div>
                  </div>
                  <Switch
                    checked={userData.preferences.dataSharing}
                    onCheckedChange={() => handleTogglePreference('dataSharing')}
                    className={`${userData.preferences.dataSharing ? 'bg-[#88B04B]' : 'bg-white/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${userData.preferences.dataSharing ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </Switch>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/10"
                onClick={() => navigate('/settings/preferences')}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
              
              <Button
                variant="link"
                className="text-red-400 hover:text-red-500"
                onClick={() => navigate('/settings/delete-account')}
              >
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  
  const { 
    isLoading, 
    error, 
    dashboardState, 
    handleAddNewDebt,
    handleViewDebtDetails,
    handleSchedulePayment,
    handleViewPaymentDetails,
    handleAddBankConnection,
    handleViewBankConnection,
    refreshDashboard,
    bankError
  } = useDashboard();

  // Subscription info (hardcoded for now, in a real app you'd fetch this from your backend)
  const subscriptionInfo = {
    currentPlan: 'pro', // or 'basic'
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  };

  // For demo purposes, we'll assume onboarding is complete
  const isOnboardingComplete = true;

  // Prevent duplicate refreshes
  const handleRefreshDashboard = useCallback(() => {
    setIsRefreshing(true);
    refreshDashboard().finally(() => {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    });
  }, [refreshDashboard]);

  // Initial data load only when user ID changes
  useEffect(() => {
    // Set up mounted flag
    isMountedRef.current = true;
    
    // Only fetch if we have a user ID
    if (user?.id) {
      handleRefreshDashboard();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [user?.id, handleRefreshDashboard]); // Adding handleRefreshDashboard with proper memoization is safe

  // Try to fix database issues if they occur
  useEffect(() => {
    if (!error) return; // Skip if no error
    
    const checkAndFixDatabase = async () => {
      if (error && (error.includes('404') || error.includes('does not exist'))) {
        setIsFixingDatabase(true);
        try {
          // Attempt to create the tables that might be missing
          await createBankAccountsTable();
          // Wait a bit then reload the page
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          console.error('Failed to fix database:', err);
          setLocalError('Database repair failed. Please contact support.');
          setIsFixingDatabase(false);
        }
      }
    };
    
    checkAndFixDatabase();
  }, [error]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in to access your dashboard</h1>
          <button
            onClick={() => navigate('/signin')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete) {
    return (
      <DashboardLayout>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 border border-white/10 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Onboarding</h2>
          <p className="text-white/70">
            Please complete the onboarding process to access your dashboard.
          </p>
          <button
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Start Onboarding
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || isFixingDatabase) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (isRefreshing) {
    return (
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <RefreshButton isRefreshing={true} onClick={() => {}} />
        </div>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (error || localError) {
    const errorMessage = localError || error;
    
    // Handle specific error cases with helpful messages
    let userFriendlyMessage = errorMessage;
    if (errorMessage?.includes('404') || errorMessage?.includes('does not exist')) {
      userFriendlyMessage = 'We encountered an issue with the database. Please try refreshing the page.';
    }
    
    return (
      <DashboardLayout>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-white/70 mb-4">
            {userFriendlyMessage}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Retry
            </button>
            {(errorMessage?.includes('404') || errorMessage?.includes('does not exist')) && (
              <button
                onClick={async () => {
                  setIsFixingDatabase(true);
                  try {
                    await createBankAccountsTable();
                    setTimeout(() => window.location.reload(), 1000);
                  } catch (err) {
                    console.error('Failed to fix database:', err);
                    setIsFixingDatabase(false);
                    setLocalError(err instanceof Error ? err.message : String(err));
                  }
                }}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Fix Database
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if we have connected accounts
  const hasConnectedAccounts = dashboardState?.bankConnections?.length > 0;

  // Handle the case when data is incomplete but not throwing errors
  const isDataIncomplete = !dashboardState || 
                          (!dashboardState.debts?.length && 
                           !dashboardState.bankConnections?.length);

  // If no accounts are connected, show a simplified dashboard with bank connection prompt
  if (!hasConnectedAccounts || isDataIncomplete) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#88B04B]/20 to-[#88B04B]/5 border border-[#88B04B]/20 backdrop-blur-sm shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Financial Dashboard</h2>
            <p className="text-white/70 mb-6">
              {isDataIncomplete 
                ? "We need your financial data to provide personalized insights. Connect your bank accounts to get started."
                : "Connect your bank accounts to get personalized insights and start tracking your financial progress."
              }
            </p>
            <Suspense fallback={<div className="p-8 rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#88B04B]"></div>
              </div>
            </div>}>
              <BankConnections />
            </Suspense>
            {isDataIncomplete && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-medium text-white">Why connect your bank accounts?</h3>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start gap-2 text-white/70">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#88B04B] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Automatically track your debts and payments</span>
                    </li>
                    <li className="flex items-start gap-2 text-white/70">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#88B04B] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Get personalized debt payoff strategies</span>
                    </li>
                    <li className="flex items-start gap-2 text-white/70">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#88B04B] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Receive tailored financial insights based on your spending habits</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={handleRefreshDashboard}
                  className="mt-4 rounded-md bg-[#88B04B] px-4 py-2 text-white hover:bg-[#7a9d43]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page header with branded gradient text */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <RefreshButton 
            onClick={handleRefreshDashboard} 
            isLoading={isRefreshing}
            className="text-white bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-white/10"
          />
        </div>

        {/* Subscription summary card */}
        <SubscriptionSummary 
          currentPlan={subscriptionInfo.currentPlan} 
          nextBillingDate={subscriptionInfo.nextBillingDate} 
        />

        {/* User Account Section */}
        <UserAccountSection />

        {/* Error handling */}
        {(error || localError) && !isFixingDatabase && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ErrorAlert 
              title="Dashboard Error" 
              message={localError || error || 'Failed to load dashboard data'} 
              action={{
                label: 'Retry',
                onClick: handleRefreshDashboard
              }}
            />
          </motion.div>
        )}

        {isFixingDatabase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#88B04B]/20 text-white p-4 rounded-lg mb-6 flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Setting up your database... This should only take a moment.</span>
          </motion.div>
        )}

        {/* Banking connection error if any */}
        {bankError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/20 border border-amber-500/40 text-amber-200 p-4 rounded-lg mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-medium">Bank Connection Issue</p>
              <p className="text-sm text-amber-200/80">{bankError}</p>
            </div>
          </motion.div>
        )}

        {/* Main dashboard content */}
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Load components with suspense fallbacks */}
            <Suspense fallback={<SkeletonCardGrid count={3} className="h-52" />}>
              <OverviewCards
                totalDebt={dashboardState?.totalDebt}
                monthlyPayment={dashboardState?.monthlyPayment}
                projectedPayoffDate={dashboardState?.projectedPayoffDate}
              />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Suspense fallback={<Skeleton variant="card" className="h-96" />}>
                <DebtBreakdown
                  debts={dashboardState?.debts || []}
                  onAddNewDebt={handleAddNewDebt}
                  onViewDebtDetails={handleViewDebtDetails}
                />
              </Suspense>

              <Suspense fallback={<Skeleton variant="card" className="h-96" />}>
                <DebtProjection
                  totalDebt={dashboardState?.totalDebt || 0}
                  projectedPayoffDate={dashboardState?.projectedPayoffDate}
                  projectionData={dashboardState?.projectionData || []}
                />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Suspense fallback={<Skeleton variant="card" className="h-96" />}>
                <NextPayment
                  nextPayment={dashboardState?.nextPayment}
                  onSchedulePayment={handleSchedulePayment}
                  onViewPaymentDetails={handleViewPaymentDetails}
                />
              </Suspense>

              <Suspense fallback={<Skeleton variant="card" className="h-96" />}>
                <BankConnections
                  connections={dashboardState?.bankConnections || []}
                  onAddConnection={handleAddBankConnection}
                  onViewConnection={handleViewBankConnection}
                />
              </Suspense>
            </div>
            
            {/* Financial Tools Section */}
            <Suspense fallback={<Skeleton variant="card" className="h-96" />}>
              <FinancialTools />
            </Suspense>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add default export
export default Dashboard;