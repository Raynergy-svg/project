import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  CreditCard, 
  Home, 
  PiggyBank, 
  Settings, 
  FileText, 
  ChevronRight, 
  LogOut, 
  User, 
  Shield, 
  CreditCard as BillingIcon,
  Menu,
  X,
  TrendingDown,
  Sparkles,
  Wallet,
  Calculator,
  Building,
  Headphones,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from './Header';
import { Logo } from '@/components/Logo';
import { DebtProjection } from '@/components/dashboard/DebtProjection';
import { SavingsOpportunities } from '@/components/dashboard/SavingsOpportunities';
import { DebtPayoffCalculator } from '@/components/dashboard/DebtPayoffCalculator';
import { Transactions } from '@/components/dashboard/Transactions';
import { useDashboard } from '@/hooks/useDashboard';
import { Debts } from '@/components/sections/Debts';
import { Savings } from '@/components/sections/Savings';
import { Reports } from '@/components/sections/Reports';
import { BankConnections } from '@/components/sections/BankConnections';
import { BackgroundAnimation } from './BackgroundAnimation';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  id: string;
  icon: React.ElementType;
}

interface TabItem {
  name: string;
  id: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboardState, handleAdjustBudget } = useDashboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('overview');
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Update active tab based on URL hash or default to dashboard
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    
    // Special case: redirect from 'security' to 'support'
    if (hash === 'security') {
      navigate('#support', { replace: true });
      return;
    }
    
    if (hash) {
      // Check if hash is a main section or a tab
      const isMainSection = [...mainNavItems].some(item => item.id === hash);
      const isTab = dashboardTabs.some(tab => tab.id === hash);
      
      if (isMainSection) {
        setActiveTab(hash);
        // Reset active section to overview when changing main sections
        setActiveSection('overview');
        // Update page title based on active tab
        const tab = [...mainNavItems, ...settingsNavItems].find(item => item.id === hash);
        if (tab) {
          setPageTitle(tab.name);
        }
      } else if (isTab) {
        // If it's a dashboard tab, set the active section
        setActiveTab('dashboard');
        setActiveSection(hash);
        setPageTitle('Dashboard');
      } else {
        // Handle settings or other sections
        setActiveTab(hash);
        const tab = [...settingsNavItems].find(item => item.id === hash);
        if (tab) {
          setPageTitle(tab.name);
        }
      }
    } else {
      // If no hash, set default tab and update URL
      setActiveTab('dashboard');
      setActiveSection('overview');
      setPageTitle('Dashboard');
      navigate('#dashboard', { replace: true });
    }
  }, [location.hash]);

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Debts', id: 'debts', icon: CreditCard },
    { name: 'Savings', id: 'savings', icon: PiggyBank },
    { name: 'Reports', id: 'reports', icon: BarChart3 },
    { name: 'Bank Connections', id: 'bank-connections', icon: Building },
  ];

  const settingsNavItems: NavItem[] = [
    { name: 'Account', id: 'account', icon: User },
    { name: 'Support', id: 'support', icon: Headphones },
    { name: 'Billing', id: 'billing', icon: BillingIcon },
  ];

  const dashboardTabs: TabItem[] = [
    { name: 'Overview', id: 'overview', icon: Home },
    { name: 'Debt Projection', id: 'debt-projection', icon: TrendingDown },
    { name: 'Transactions', id: 'transactions', icon: DollarSign },
    { name: 'Payoff Calculator', id: 'payoff-calculator', icon: Calculator },
    { name: 'Savings', id: 'savings-opportunities', icon: Wallet },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (id: string) => {
    return activeTab === id;
  };

  const isActiveSection = (id: string) => {
    return activeSection === id;
  };

  const handleNavClick = (id: string, name: string) => {
    setActiveTab(id);
    setPageTitle(name);
    navigate(`#${id}`);
    
    // Close mobile sidebar when an item is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleTabClick = (id: string) => {
    setActiveSection(id);
    navigate(`#${id}`);
  };

  const handleSignOut = () => {
    // Handle sign out logic here
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Sidebar for desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900/80 backdrop-blur-md border-r border-white/5 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button (mobile only) */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <div onClick={() => handleNavClick('dashboard', 'Dashboard')} className="flex items-center gap-1.5 cursor-pointer">
              <Logo showText={false} size="sm" isLink={false} />
              <span className="text-sm font-semibold tracking-wide">Smart Debt Flow</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-3">
            <div className="space-y-0.5">
              {mainNavItems.map((item) => {
                // Create a local variable for the icon component
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.name)}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                      isActive(item.id)
                        ? 'bg-[#88B04B]/20 text-white border border-[#88B04B]/30'
                        : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                    }`}
                  >
                    {/* Render the icon component explicitly */}
                    <IconComponent
                      className={`mr-2.5 h-4 w-4 flex-shrink-0 ${
                        isActive(item.id) ? 'text-[#88B04B]' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-3 border-t border-white/5">
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Settings
              </h3>
              <div className="space-y-0.5">
                {settingsNavItems.map((item) => {
                  // Create a local variable for the icon component
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.name)}
                      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                        isActive(item.id)
                          ? 'bg-[#88B04B]/20 text-white border border-[#88B04B]/30'
                          : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                      }`}
                    >
                      {/* Render the icon component explicitly */}
                      <IconComponent
                        className={`mr-2.5 h-4 w-4 flex-shrink-0 ${
                          isActive(item.id) ? 'text-[#88B04B]' : 'text-gray-400 group-hover:text-white'
                        }`}
                      />
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email || ''}</p>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 border border-white/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-gray-900/90 backdrop-blur-md px-4 md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <Logo showText={false} size="xs" isLink={false} />
              <span className="text-xs font-semibold tracking-wide text-white">Smart Debt Flow</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-xs h-8"
            >
              <LogOut className="h-3 w-3 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Dashboard header and tabs */}
        {activeTab === 'dashboard' && (
          <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
            <div className="px-6 pt-3">
              <Header title="" subtitle="Manage your financial journey" />
            </div>
            
            {/* Dashboard tabs - simplified design */}
            <div className="px-6 py-3">
              <nav className="flex overflow-x-auto bg-gray-800/40 backdrop-blur-sm rounded-lg border border-white/5 no-scrollbar">
                {dashboardTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = isActiveSection(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`relative flex items-center gap-2 cursor-pointer px-5 py-2.5 transition-all whitespace-nowrap flex-1 justify-center ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      aria-selected={isActive}
                    >
                      <TabIcon
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive 
                            ? 'text-[#88B04B]' 
                            : 'text-gray-400'
                        }`}
                      />
                      <span className="text-sm font-medium">{tab.name}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#88B04B] mx-2"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
        
        {/* Section-specific headers */}
        {activeTab !== 'dashboard' && (
          <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md border-b border-white/10 px-6 py-3">
            <Header title={pageTitle} subtitle="Manage your financial journey" />
          </div>
        )}

        {/* Main content based on active tab and section */}
        <div className="p-6">
          {/* Dashboard sections */}
          {activeTab === 'dashboard' && (
            <div className="px-4 py-6 md:px-6">
              {activeSection === 'overview' && children}
              {activeSection === 'debt-projection' && <DebtProjection debts={dashboardState.debtBreakdown} />}
              {activeSection === 'transactions' && <Transactions />}
              {activeSection === 'payoff-calculator' && <DebtPayoffCalculator debts={dashboardState.debtBreakdown} />}
              {activeSection === 'savings-opportunities' && <SavingsOpportunities />}
            </div>
          )}

          {/* Main sections */}
          {activeTab === 'debts' && <Debts />}
          {activeTab === 'savings' && <Savings />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'bank-connections' && <BankConnections />}

          {/* Settings sections */}
          {activeTab === 'account' && (
            <div className="rounded-lg border border-white/10 bg-gray-900/50 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <p className="text-gray-400">Manage your account preferences and personal information.</p>
            </div>
          )}
          {activeTab === 'support' && (
            <div className="rounded-lg border border-white/10 bg-gray-900/50 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Support</h2>
              <p className="text-gray-400">Get help with your account or financial questions.</p>
            </div>
          )}
          {activeTab === 'billing' && (
            <div className="rounded-lg border border-white/10 bg-gray-900/50 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Billing</h2>
              <p className="text-gray-400">Manage your subscription and payment methods.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 