'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  Menu,
  X,
  TrendingDown,
  Sparkles,
  Wallet,
  Calculator,
  Building,
  Headphones,
  DollarSign,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-adapter';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Main navigation items
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Debt Overview', href: '/dashboard/debts', icon: TrendingDown },
    { name: 'Savings', href: '/dashboard/savings', icon: PiggyBank },
    { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Calculator', href: '/dashboard/calculator', icon: Calculator },
  ];

  // Secondary navigation items
  const secondaryNavItems: NavItem[] = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help Center', href: '/help', icon: Headphones },
    { name: 'Support', href: '/support', icon: Building },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if a navigation item is active
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b">
          <Logo />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <motion.div 
            className="fixed inset-y-0 left-0 z-40 w-64 bg-card p-4" 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <Logo />
              </div>
              
              <div className="space-y-1 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="space-y-1 mb-8">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Support
                </h3>
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:border-r transition-all duration-300 ${
        isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
      }`}>
        <div className="flex flex-col h-full bg-card p-4">
          <div className="flex items-center justify-between mb-6">
            {isSidebarOpen ? (
              <Logo />
            ) : (
              <div className="mx-auto">
                <Logo showText={false} />
              </div>
            )}
            {isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </div>
          
          <div className="space-y-1 mb-8">
            {isSidebarOpen && (
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Support
              </h3>
            )}
            {secondaryNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </div>
          
          {/* User profile or sign out at the bottom */}
          <div className="mt-auto">
            {user && isSidebarOpen ? (
              <div className="flex items-center p-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium">{user.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            ) : null}
            
            <Button 
              variant="outline" 
              className={`${isSidebarOpen ? 'w-full justify-start' : 'mx-auto'}`} 
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={`min-h-screen lg:pl-${isSidebarOpen ? '64' : '20'}`}>
        {children}
      </main>
    </div>
  );
} 