"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Settings,
  FileText,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Debts",
    href: "/dashboard/debts",
    icon: CreditCard,
    badge: "New",
  },
  {
    title: "Savings",
    href: "/dashboard/savings",
    icon: PiggyBank,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Check if mobile on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button removed since it's now in the header */}

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || mobileMenuOpen) && (
          <motion.aside
            initial={isMobile ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -300 } : undefined}
            transition={{ ease: "easeOut", duration: 0.3 }}
            className={cn(
              "fixed left-0 top-0 z-40 h-screen dashboard-sidebar border-r border-border transition-all duration-300",
              isCollapsed && !isMobile ? "w-[80px]" : "w-[240px]",
              isMobile ? "shadow-xl" : "" // Add shadow to mobile menu for better visibility
            )}
          >
            {/* Logo section - updated to prevent navigation to landing page */}
            <div className="flex h-16 items-center border-b border-border px-4">
              <div
                className="cursor-pointer"
                onClick={isMobile ? toggleMenu : undefined}
              >
                <Logo
                  size="sm"
                  showText={!isCollapsed || isMobile}
                  isLink={false} // Prevent navigation to homepage
                />
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex h-[calc(100vh-4rem)] flex-col justify-between py-4">
              <div className="space-y-1 px-3">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={
                        isMobile ? () => setMobileMenuOpen(false) : undefined
                      }
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {(!isCollapsed || isMobile) && (
                        <>
                          <span>{link.title}</span>
                          {link.badge && (
                            <Badge className="ml-auto text-xs py-0 h-5 bg-green-500/90 text-white">
                              {link.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {isCollapsed && !isMobile && link.badge && (
                        <Badge className="absolute -right-1 -top-1 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-green-500/90 text-white">
                          !
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-4 px-3">
                {/* User profile section */}
                <div
                  className={cn(
                    "p-3 rounded-lg bg-muted/50",
                    isCollapsed && !isMobile
                      ? "text-center"
                      : "flex items-center gap-3"
                  )}
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>

                  {(!isCollapsed || isMobile) && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Collapse button - hide on mobile */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="ml-2">Collapse</span>
                      </>
                    )}
                  </Button>
                )}

                {/* Sign out button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-2">Sign Out</span>
                  )}
                </Button>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 pt-4 relative",
          isMobile ? "ml-0" : isCollapsed ? "ml-[80px]" : "ml-[240px]"
        )}
      >
        {/* Header bar for mobile & desktop */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-4">
            {/* Mobile menu toggle button - visible only on mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}

            {!isMobile && (
              <form className="hidden lg:flex-1 lg:flex max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-background pl-8 h-9 rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle in header for all cases */}
            <ThemeToggle variant="icon" />

            <Tooltip content="Help & Support">
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help</span>
              </Button>
            </Tooltip>

            <Tooltip content="Notifications">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </Tooltip>
          </div>
        </header>

        <div className="container mx-auto p-4 lg:p-8">{children}</div>
      </main>

      {/* Overlay for mobile menu - click to close */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
