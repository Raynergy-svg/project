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
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from './Header';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setPageTitle('Dashboard');
    else if (path.includes('/debts')) setPageTitle('Debt Management');
    else if (path.includes('/savings')) setPageTitle('Savings Goals');
    else if (path.includes('/reports')) setPageTitle('Financial Reports');
    else if (path.includes('/bank-connections')) setPageTitle('Bank Connections');
    else if (path.includes('/settings')) {
      if (path.includes('/account')) setPageTitle('Account Settings');
      else if (path.includes('/security')) setPageTitle('Security Settings');
      else if (path.includes('/billing')) setPageTitle('Billing & Subscription');
      else setPageTitle('Settings');
    }
  }, [location.pathname]);

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Debts', href: '/debts', icon: CreditCard },
    { name: 'Savings', href: '/savings', icon: PiggyBank },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Bank Connections', href: '/bank-connections', icon: FileText },
  ];

  const settingsNavItems: NavItem[] = [
    { name: 'Account', href: '/settings/account', icon: User },
    { name: 'Security', href: '/settings/security', icon: Shield },
    { name: 'Billing', href: '/settings/billing', icon: BillingIcon },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
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
            <RouterLink to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">FinTrack</span>
            </RouterLink>
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
              {mainNavItems.map((item) => (
                <RouterLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </RouterLink>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                {settingsNavItems.map((item) => (
                  <RouterLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </RouterLink>
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-300" />
                  )}
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
            {children}
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