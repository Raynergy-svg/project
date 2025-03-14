'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/components/ThemeProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface NavbarProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  isAuthenticated?: boolean;
  userName?: string;
  onDashboardClick?: () => void;
  onNavigate?: (sectionId: string) => void;
  isMobile?: boolean;
  transparent?: boolean;
}

interface NavItem {
  id?: string;
  label: string;
  type: 'scroll' | 'menu';
  href?: string;
  items?: Array<{
    label: string;
    href: string;
  }>;
}

export default function Navbar({
  onSignIn,
  onSignUp,
  isAuthenticated,
  userName,
  onDashboardClick,
  onNavigate,
  transparent = false
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const router = useRouter();
  const pathname = usePathname();
  const isReducedMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const backgroundColor = "rgba(0, 0, 0, 0.9)";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
    setOpenDropdowns([]);
  }, [pathname]);

  // Add effect to prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems: NavItem[] = [
    { id: 'features', label: 'Features', type: 'scroll' },
    { id: 'methods', label: 'Methods', type: 'scroll' },
    { id: 'pricing', label: 'Pricing', type: 'scroll' },
    { 
      label: 'Company',
      type: 'menu',
      items: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' }
      ]
    },
    { 
      label: 'Resources',
      type: 'menu',
      items: [
        { label: 'Help Center', href: '/help' },
        { label: 'Financial Resources', href: '/docs' },
        { label: 'Status', href: '/status' }
      ]
    },
    { 
      label: 'Legal',
      type: 'menu',
      items: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security', href: '/security' },
        { label: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  const handleNavigation = (id?: string, href?: string) => {
    if (id && onNavigate) {
      onNavigate(id);
      setIsMenuOpen(false);
    } else if (href) {
      router.push(href);
      setIsMenuOpen(false);
    }
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => {
      if (prev.includes(label)) {
        return prev.filter(item => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  // Improved mobile menu with better touch targets and animations
  const renderMobileMenu = () => {
    return (
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: isReducedMotion ? 0 : 0.2 }}
          >
            <div className="container h-full flex flex-col">
              <div className="flex items-center justify-between py-4">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-8">
                <nav className="flex flex-col space-y-6">
                  {navItems.map((item) => (
                    <div key={item.label} className="flex flex-col">
                      {item.type === 'scroll' ? (
                        <button
                          onClick={() => handleNavigation(item.id)}
                          className="text-xl font-medium py-3 text-left flex items-center"
                          aria-label={`Navigate to ${item.label} section`}
                        >
                          {item.label}
                        </button>
                      ) : item.type === 'menu' && item.items ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className="text-xl font-medium py-3 text-left flex items-center justify-between"
                            aria-expanded={openDropdowns.includes(item.label)}
                            aria-label={`Toggle ${item.label} menu`}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                "ml-1 h-5 w-5 transition-transform",
                                openDropdowns.includes(item.label) && "rotate-180"
                              )}
                            />
                          </button>
                          
                          <AnimatePresence>
                            {openDropdowns.includes(item.label) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: isReducedMotion ? 0 : 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 py-2 flex flex-col space-y-4">
                                  {item.items.map((subItem) => (
                                    <button
                                      key={subItem.label}
                                      onClick={() => handleNavigation(undefined, subItem.href)}
                                      className="text-lg py-2 text-left"
                                      aria-label={`Navigate to ${subItem.label}`}
                                    >
                                      {subItem.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href || '#'}
                          className="text-xl font-medium py-3"
                          aria-label={`Navigate to ${item.label}`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              
              <div className="py-6 border-t border-border mt-auto">
                <div className="flex flex-col space-y-4">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={onSignIn}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onSignUp}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onDashboardClick}
                    >
                      Dashboard
                    </Button>
                  )}
                  
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setTheme("light")}
                      aria-label="Light mode"
                    >
                      <Sun className={cn("h-5 w-5", theme === "light" && "text-primary")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setTheme("dark")}
                      aria-label="Dark mode"
                    >
                      <Moon className={cn("h-5 w-5", theme === "dark" && "text-primary")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setTheme("system")}
                      aria-label="System theme"
                    >
                      <Monitor className={cn("h-5 w-5", theme === "system" && "text-primary")} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled || !transparent ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <Logo />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.type === 'scroll' ? (
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : item.type === 'menu' && item.items ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={cn(
                          "px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 transition-colors flex items-center",
                          openDropdowns.includes(item.label) && "bg-accent/50"
                        )}
                        aria-expanded={openDropdowns.includes(item.label)}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "ml-1 h-4 w-4 transition-transform",
                            openDropdowns.includes(item.label) && "rotate-180"
                          )}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {openDropdowns.includes(item.label) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: isReducedMotion ? 0 : 0.2 }}
                            className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                          >
                            <div className="py-1">
                              {item.items.map((subItem) => (
                                <button
                                  key={subItem.label}
                                  onClick={() => handleNavigation(undefined, subItem.href)}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                                >
                                  {subItem.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={onSignIn}
                    className="hidden sm:inline-flex"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onSignUp}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onDashboardClick}
                >
                  Dashboard
                </Button>
              )}
              
              <div className="hidden lg:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setTheme("light")}
                  aria-label="Light mode"
                >
                  <Sun className={cn("h-4 w-4", theme === "light" && "text-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setTheme("dark")}
                  aria-label="Dark mode"
                >
                  <Moon className={cn("h-4 w-4", theme === "dark" && "text-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setTheme("system")}
                  aria-label="System theme"
                >
                  <Monitor className={cn("h-4 w-4", theme === "system" && "text-primary")} />
                </Button>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {renderMobileMenu()}
      
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}
