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
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from './Header';
import { DebtProjection } from '@/components/dashboard/DebtProjection';
import { BudgetOptimizer } from '@/components/dashboard/BudgetOptimizer';
import { SavingsOpportunities } from '@/components/dashboard/SavingsOpportunities';
import { DebtPayoffCalculator } from '@/components/dashboard/DebtPayoffCalculator';
import { useDashboard } from '@/hooks/useDashboard';
import { Debts } from '@/components/sections/Debts';
import { Savings } from '@/components/sections/Savings';
import { Reports } from '@/components/sections/Reports';
import { BankConnections } from '@/components/sections/BankConnections';

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
    { name: 'Security', id: 'security', icon: Shield },
    { name: 'Billing', id: 'billing', icon: BillingIcon },
  ];

  const dashboardTabs: TabItem[] = [
    { name: 'Overview', id: 'overview', icon: Home },
    { name: 'Debt Projection', id: 'debt-projection', icon: TrendingDown },
    { name: 'Budget Optimizer', id: 'budget-optimizer', icon: Sparkles },
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
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar for desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button (mobile only) */}
          <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
            <div onClick={() => handleNavClick('dashboard', 'Dashboard')} className="flex items-center space-x-2 cursor-pointer">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">FinTrack</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                // Create a local variable for the icon component
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.name)}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer ${
                      isActive(item.id)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {/* Render the icon component explicitly */}
                    <IconComponent
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                {settingsNavItems.map((item) => {
                  // Create a local variable for the icon component
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.name)}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer ${
                        isActive(item.id)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {/* Render the icon component explicitly */}
                      <IconComponent
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive(item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'
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
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-300" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{user?.name}</div>
                <div className="truncate text-xs text-gray-400">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-auto flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header title={pageTitle} onToggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black to-gray-900 p-4 md:p-6">
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#88B04B]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[150px]" />
          </div>
          
          {/* Page content */}
          <div className="mx-auto max-w-7xl">
            {/* Dashboard tabs - only show when dashboard is active */}
            {activeTab === 'dashboard' && (
              <div className="mb-6">
                <div className="flex overflow-x-auto pb-2 space-x-2">
                  {dashboardTabs.map((tab) => {
                    // Create a local variable for the icon component
                    const IconComponent = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                          isActiveSection(tab.id)
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Render the icon component explicitly */}
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Only show content for active tab */}
            {activeTab === 'dashboard' && (
              <>
                {activeSection === 'overview' && children}
                {activeSection === 'debt-projection' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-white mb-6">Debt Projection</h1>
                    <DebtProjection />
                  </motion.div>
                )}
                {activeSection === 'budget-optimizer' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-white mb-6">Budget Optimizer</h1>
                    <BudgetOptimizer 
                      dashboardState={dashboardState} 
                      onAdjustBudget={handleAdjustBudget} 
                    />
                  </motion.div>
                )}
                {activeSection === 'payoff-calculator' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-white mb-6">Debt Payoff Calculator</h1>
                    <DebtPayoffCalculator />
                  </motion.div>
                )}
                {activeSection === 'savings-opportunities' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-white mb-6">Savings Opportunities</h1>
                    <SavingsOpportunities />
                  </motion.div>
                )}
              </>
            )}
            {activeTab !== 'dashboard' && (
              <>
                {activeTab === 'debts' && (
                  <motion.div
                    key="debts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Debts />
                  </motion.div>
                )}
                {activeTab === 'savings' && (
                  <motion.div
                    key="savings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Savings />
                  </motion.div>
                )}
                {activeTab === 'reports' && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Reports />
                  </motion.div>
                )}
                {activeTab === 'bank-connections' && (
                  <motion.div
                    key="bank-connections"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BankConnections />
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 