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
    if (href) {
      router.push(href);
      return;
    }

    if (!id) return;

    if (onNavigate) {
      onNavigate(id);
      return;
    }

    if (pathname !== '/') {
      router.push('/');
      // Store the section to scroll to after navigation
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scrollToSection', id);
      }
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: isReducedMotion ? 'auto' : 'smooth' 
      });
    }
    setIsMenuOpen(false);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <motion.nav 
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-black backdrop-blur-lg shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.id || item.label} className="relative group">
                {item.type === 'menu' ? (
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                    {item.label}
                    <ChevronDown className="w-4 h-4 ml-1" />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px]">
                      <div className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-xl">
                        <div className="py-1">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                  setTheme(nextTheme);
                }}
                className="text-gray-300 hover:text-white"
              >
                {theme === 'light' ? (
                  <Sun className="h-5 w-5" />
                ) : theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
              </Button>
            </div>
            {isAuthenticated ? (
              <Button
                onClick={onDashboardClick}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Dashboard
                {userName && <span className="ml-2">{userName.split(' ')[0]}</span>}
              </Button>
            ) : (
              <>
                <Button
                  onClick={onSignIn}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Sign In
                </Button>
                <Button
                  onClick={onSignUp}
                  className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white transition-opacity"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 bg-black border-t border-gray-800 p-4 space-y-4 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              {navItems.map((item) => (
                <div key={item.id || item.label}>
                  {item.type === 'menu' ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className="flex items-center justify-between w-full text-white font-medium py-2"
                      >
                        <span>{item.label}</span>
                        <motion.div
                          animate={{ rotate: openDropdowns.includes(item.label) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openDropdowns.includes(item.label) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1 pl-4 py-2 bg-gray-900 rounded-lg">
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className="block py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenDropdowns([]);
                                  }}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className="block w-full text-left py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-800">
                {isAuthenticated ? (
                  <Button
                    onClick={() => {
                      onDashboardClick?.();
                      setIsMenuOpen(false);
                      setOpenDropdowns([]);
                    }}
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                  >
                    Dashboard
                    {userName && <span className="ml-2">{userName.split(' ')[0]}</span>}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        onSignIn?.();
                        setIsMenuOpen(false);
                        setOpenDropdowns([]);
                      }}
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        onSignUp?.();
                        setIsMenuOpen(false);
                        setOpenDropdowns([]);
                      }}
                      className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-white transition-opacity"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
