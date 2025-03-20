"use client";

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
  type: "scroll" | "menu";
  href?: string;
  renderIf?: boolean;
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
  transparent = false,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();
  const router = useRouter();
  const pathname = usePathname();
  const isReducedMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const backgroundColor = "rgba(0, 0, 0, 0.9)";

  // Debug current path to help troubleshoot routing issues
  useEffect(() => {
    if (pathname) {
      console.log('Current pathname:', pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);
  
  // Debug dropdown state changes
  useEffect(() => {
    console.log('Current openDropdowns state:', openDropdowns);
  }, [openDropdowns]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    toggleDropdown(label);
  };

  const handleMouseLeave = (label: string) => {
    setDropdownTimeout(setTimeout(() => {
      toggleDropdown(label);
    }, 200)); // Adjust the delay time as needed
  };

  // Define nav items with explicit renderIf conditions to control visibility
  const navItems: NavItem[] = [
    { id: "features", label: "Features", type: "scroll", renderIf: true },
    { id: "methods", label: "Methods", type: "scroll", renderIf: true },
    { id: "pricing", label: "Pricing", type: "scroll", renderIf: true },
    {
      label: "Company",
      type: "menu",
      renderIf: true,
      items: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      label: "Resources",
      type: "menu",
      renderIf: true,
      items: [
        { label: "Help Center", href: "/help" },
        { label: "Financial Resources", href: "/docs" },
        { label: "Status", href: "/status" },
      ],
    },
    {
      label: "Legal",
      type: "menu",
      renderIf: true,
      items: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security", href: "/security" },
      ],
    },
  ];

  // Enhanced list of all routes that use App Router - keep this in sync with middleware.ts
  const appRouterPages = [
    // Core pages
    '/dashboard', '/dashboard/',
    '/about', '/about/',
    '/careers', '/careers/',
    '/blog', '/blog/',
    '/auth', '/auth/',
    '/help', '/help/',
    '/docs', '/docs/',
    '/privacy', '/privacy/',
    '/security', '/security/',
    '/status', '/status/',
    '/terms', '/terms/',
    '/apply', '/apply/',
    
    // Ensure homepage is detected as App Router
    '/', 
    '/index', 
    ''
  ];

  /**
   * Enhanced function to check if a path is handled by the App Router
   * This is important for properly routing in Next.js
   * @param path The path to check
   */
  const isAppRouterPath = (path: string) => {
    // Normalize the path by removing trailing slash for consistency
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Debug
    console.log('Checking if path is App Router path:', { 
      original: path, 
      normalized: normalizedPath 
    });
    
    // Exact match (including the normalized version)
    if (appRouterPages.includes(normalizedPath) || appRouterPages.includes(path)) {
      console.log('Found exact match in App Router paths');
      return true;
    }
    
    // Check if it's a child route of an App Router page
    const isChildPath = appRouterPages.some(appPath => {
      // Skip the root path for this check to avoid false positives
      if (appPath === '/' || appPath === '') return false;
      
      // For child path detection, we want paths that end with slash
      const parentPath = appPath.endsWith('/') ? appPath : `${appPath}/`;
      const isChild = normalizedPath.startsWith(parentPath.slice(0, -1));
      
      if (isChild) {
        console.log('Found as child of App Router path:', parentPath);
      }
      
      return isChild;
    });
    
    if (!isChildPath) {
      console.log('Not an App Router path, using Pages Router');
    }
    
    return isChildPath;
  };
  
  /**
   * Handles navigation between pages
   */
  const handleNavigation = (id?: string, href?: string) => {
    // Debug info
    console.log('handleNavigation called with:', { id, href });
    console.log('Current pathname:', pathname);
    console.log('Available props:', { 
      onNavigate: !!onNavigate, 
      router: !!router,
      isMenuOpen
    });

    if (id && onNavigate) {
      console.log('Using onNavigate callback for section:', id);
      onNavigate(id);
      setIsMenuOpen(false);
    } else if (href) {
      // Use window.location for external navigation to ensure proper page load
      if (href.startsWith('http')) {
        console.log('Navigating to external URL:', href);
        window.location.href = href;
      } else {
        try {
          if (pathname === href) {
            // If already on the page, just close the menu
            console.log('Already on page, closing menu');
            setIsMenuOpen(false);
            return;
          }

          // For App Router pages, always use the router for client-side navigation
          // This is the proper way to navigate in Next.js 13+ with App Router
          if (isAppRouterPath(href)) {
            console.log('Using Next.js router for App Router page:', href);
            if (!router) {
              console.error('Router is undefined but trying to navigate to:', href);
              window.location.href = href;
              return;
            }
            router.push(href);
            setIsMenuOpen(false);
            return;
          }
          
          // Check if we're navigating to a parent route from a nested route in Pages Router
          const isNavigatingUp = pathname && pathname.startsWith(href + '/');
          
          if (isNavigatingUp) {
            // Force a full navigation for parent routes to avoid 404s
            console.log('Navigating up to parent route, using window.location:', href);
            window.location.href = href;
          } else {
            // Use router for normal Next.js navigation
            console.log('Using Next.js router for Pages Router page:', href);
            if (!router) {
              console.error('Router is undefined but trying to navigate to:', href);
              window.location.href = href;
              return;
            }
            router.push(href);
          }
          setIsMenuOpen(false);
        } catch (err) {
          console.error('Navigation error:', err);
          // Fallback to direct navigation
          console.log('Using fallback navigation method with window.location');
          window.location.href = href;
        }
      }
    } else {
      console.warn('handleNavigation called with no id or href');
    }
  };

  const toggleDropdown = (label: string) => {
    console.log('Toggling dropdown for:', label);
    setOpenDropdowns((prev) => {
      // Toggle this dropdown without affecting others
      const newState = prev.includes(label) 
        ? prev.filter((item) => item !== label)
        : [...prev, label];
      
      console.log('Dropdown state changing from', prev, 'to', newState);
      return newState;
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
                <div className="-ml-3">
                  <Logo size="lg" />
                </div>
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

              <div className="flex-1 overflow-y-auto py-10">
                <nav className="flex flex-col space-y-8">
                  {navItems.filter(item => item.renderIf !== false).map((item) => (
                    <div key={item.label} className="flex flex-col">
                      {item.type === "scroll" ? (
                        <button
                          onClick={() => handleNavigation(item.id)}
                          className="text-xl font-medium py-3 text-left flex items-center dark:text-white text-gray-800"
                          aria-label={`Navigate to ${item.label} section`}
                        >
                          {item.label}
                        </button>
                      ) : item.type === "menu" && item.items ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              console.log('Mobile dropdown toggled:', item.label);
                              toggleDropdown(item.label);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium flex items-center dark:text-white text-gray-800",
                              openDropdowns.includes(item.label) && "bg-accent/50"
                            )}
                            aria-expanded={openDropdowns.includes(item.label)}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                "ml-1 h-5 w-5 transition-transform",
                                openDropdowns.includes(item.label) && "rotate-180"
                              )}
                            />
                          </button>
                          {openDropdowns.includes(item.label) && (
                            <div
                              className="absolute left-0 top-full mt-2 min-w-[200px] rounded-md shadow-lg bg-white dark:bg-gray-800 focus:outline-none z-[9999] overflow-visible"
                            >
                              <div className="py-1 bg-white dark:bg-gray-800">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    href={subItem.href}
                                    onClick={() =>
                                      handleNavigation(
                                        undefined,
                                        subItem.href
                                      )
                                    }
                                    className="text-lg py-2 text-left dark:text-white text-gray-800"
                                    aria-label={`Navigate to ${subItem.label}`}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className="text-xl font-medium py-3 dark:text-white text-gray-800"
                          aria-label={`Navigate to ${item.label}`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="py-8 border-t border-border mt-auto">
                <div className="flex flex-col space-y-6">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={onSignIn}
                        className="bg-white/10 text-white border-white/20 dark:text-white text-gray-800 whitespace-nowrap"
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="default"
                        onClick={onSignUp}
                        className="bg-[#1DB954] text-white border-none whitespace-nowrap"
                      >
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <Button onClick={onDashboardClick} className="px-5" size="lg">Dashboard</Button>
                  )}

                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full dark:text-white text-gray-800"
                      onClick={() => setTheme("light")}
                      aria-label="Light mode"
                    >
                      <Sun
                        className={cn(
                          "h-5 w-5",
                          theme === "light" && "text-primary"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full dark:text-white text-gray-800"
                      onClick={() => setTheme("dark")}
                      aria-label="Dark mode"
                    >
                      <Moon
                        className={cn(
                          "h-5 w-5",
                          theme === "dark" && "text-primary"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full dark:text-white text-gray-800"
                      onClick={() => setTheme("system")}
                      aria-label="System theme"
                    >
                      <Monitor
                        className={cn(
                          "h-5 w-5",
                          theme === "system" && "text-primary"
                        )}
                      />
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
          isScrolled || !transparent
            ? "bg-background/95 backdrop-blur-sm shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-24 py-2">
            <div className="flex items-center -ml-3 md:-ml-4 mr-4">
              <Logo size="xl" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3 lg:space-x-5 mx-6">
              {/* Desktop nav items mapping - only show items with renderIf true or undefined */}
              {navItems.filter(item => item.renderIf !== false).map((item) => {
                return (
                  <div key={item.label} className="relative group">
                    {item.type === "scroll" ? (
                      <button
                        onClick={() => {
                          console.log('Desktop scroll item clicked:', item);
                          handleNavigation(item.id);
                        }}
                        className="px-3 py-2 rounded-md text-sm font-medium dark:text-white text-gray-800"
                      >
                        {item.label}
                      </button>
                    ) : item.type === "menu" && item.items ? (
                      <div className="relative" style={{cursor: 'pointer'}}>
                        <button
                          onClick={() => {
                            console.log('Desktop menu item clicked:', item);
                            toggleDropdown(item.label);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium flex items-center dark:text-white text-gray-800",
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

                      {openDropdowns.includes(item.label) && (
                        <div
                          className="absolute left-0 top-full mt-2 min-w-[200px] rounded-md shadow-lg bg-white dark:bg-gray-800 focus:outline-none z-[9999] overflow-visible"
                        >
                            <div className="py-1 bg-white dark:bg-gray-800">
                              {item.items.map((subItem) => (
                                <Link
                                  key={subItem.label}
                                  href={subItem.href}
                                  onClick={() =>
                                    handleNavigation(undefined, subItem.href)
                                  }
                                  className="block w-full text-left px-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-800"
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="px-3 py-2 rounded-md text-sm font-medium dark:text-white text-gray-800"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
              })}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-6">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={onSignIn}
                    className="hidden sm:inline-flex dark:text-white text-gray-800 px-5 whitespace-nowrap"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={onSignUp}
                    className="bg-[#1DB954] text-white border-none px-5 py-2 whitespace-nowrap"
                    size="lg"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button onClick={onDashboardClick} className="px-5" size="lg">Dashboard</Button>
              )}

              <div className="hidden lg:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full dark:text-white text-gray-800"
                  onClick={() => setTheme("light")}
                  aria-label="Light mode"
                >
                  <Sun
                    className={cn(
                      "h-4 w-4",
                      theme === "light" && "text-primary"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full dark:text-white text-gray-800"
                  onClick={() => setTheme("dark")}
                  aria-label="Dark mode"
                >
                  <Moon
                    className={cn(
                      "h-4 w-4",
                      theme === "dark" && "text-primary"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full dark:text-white text-gray-800"
                  onClick={() => setTheme("system")}
                  aria-label="System theme"
                >
                  <Monitor
                    className={cn(
                      "h-4 w-4",
                      theme === "system" && "text-primary"
                    )}
                  />
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
