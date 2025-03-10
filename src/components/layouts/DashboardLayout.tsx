'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-adapter';
import { SEO } from '@/components/SEO';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Calendar, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

/**
 * Dashboard Layout Component
 * 
 * This layout serves as the container for all authenticated dashboard pages. 
 * It includes:
 * - Responsive sidebar navigation with collapsible menu
 * - Dashboard header with user profile dropdown and notifications
 * - Authentication check with redirect for unauthenticated users
 * - Consistent styling across dashboard pages
 */
export function DashboardLayout({
  children,
  title = 'Dashboard',
  description = 'Manage your debt and financial journey.',
  fullWidth = false,
}: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { error } = useToast();
  
  // Authentication check and redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(currentPath));
    }
  }, [isAuthenticated, isLoading, router, currentPath]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Failed to sign out', err);
      error({
        title: 'Sign out failed',
        description: 'Could not sign you out. Please try again.'
      });
    }
  };
  
  // Navigation items
  const navItems = [
    { 
      title: 'Dashboard', 
      href: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      title: 'Debts', 
      href: '/dashboard/debts', 
      icon: <CreditCard className="w-5 h-5" /> 
    },
    { 
      title: 'Payments', 
      href: '/dashboard/payments', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      title: 'Reports', 
      href: '/dashboard/reports', 
      icon: <BarChart3 className="w-5 h-5" /> 
    },
    { 
      title: 'Settings', 
      href: '/settings', 
      icon: <Settings className="w-5 h-5" /> 
    }
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-full max-w-md" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect handled by useEffect, just show loading during the redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // Check if the current route is active
  const isActive = (href: string) => {
    if (href === '/dashboard' && router.pathname === '/dashboard') {
      return true;
    }
    return router.pathname.startsWith(href) && href !== '/dashboard';
  };
  
  return (
    <>
      <SEO 
        title={`${title} | Smart Debt Flow`}
        description={description}
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        {/* Dashboard header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold">
                    SDF
                  </div>
                  <span className="font-semibold hidden md:inline-block">
                    Smart Debt Flow
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 h-9 w-64 rounded-md border bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
              
              {/* User profile dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name || 'User avatar'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-medium">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user?.name || user?.email || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-card shadow-lg border z-50">
                    <div className="p-2">
                      <div className="p-2 mb-1 border-b">
                        <p className="font-medium">{user?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <div className="mt-1">
                        <Link
                          href="/settings/account"
                          className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-accent"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Account settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 p-2 text-sm rounded-md hover:bg-accent text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`
              ${sidebarOpen ? 'flex' : 'hidden lg:flex'} 
              w-64 flex-shrink-0 flex-col border-r bg-card transition-all duration-300
              fixed left-0 lg:relative top-16 lg:top-0 bottom-0 z-40
            `}
          >
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                        ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent'
                        }
                      `}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Sidebar footer */}
            <div className="p-4 border-t">
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-1">Debt Freedom</h4>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${user?.debtProgress || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.debtProgress || 0}% complete
                </p>
              </div>
            </div>
          </aside>
          
          {/* Backdrop for mobile */}
          {sidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={toggleSidebar}
              aria-hidden="true"
            ></div>
          )}
          
          {/* Main content */}
          <main className={`flex-1 overflow-auto p-6 ${fullWidth ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout; 