import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSignIn: () => void;
  onSignUp: () => void;
  isAuthenticated: boolean;
  userName?: string;
  onDashboardClick: () => void;
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
  onDashboardClick
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(30, 30, 30, 0)", "rgba(30, 30, 30, 0.98)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    { id: 'features', label: 'Features', type: 'scroll' },
    { id: 'debt-management', label: 'Methods', type: 'scroll' },
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
        { label: 'Documentation', href: '/docs' },
        { label: 'Status', href: '/status' }
      ]
    },
    { 
      label: 'Legal',
      type: 'menu',
      items: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Support', href: '/support' },
        { label: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  const handleNavigation = (id?: string, href?: string) => {
    if (href) {
      navigate(href);
      return;
    }

    if (!id) return;

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      isScrolled ? 'bg-black/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.id || item.label} className="relative group">
                {item.type === 'menu' ? (
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                    {item.label}
                    <motion.div
                      animate={{ rotate: 0 }}
                      className="group-hover:rotate-180 transition-transform"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                )}
                {item.type === 'menu' && item.items && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="bg-black/90 backdrop-blur-lg rounded-lg border border-white/10 py-2 min-w-[200px]">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sign In / Dashboard Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={onSignIn}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button
              onClick={onSignUp}
              className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              className="absolute top-16 left-0 right-0 bg-black/90 border-t border-white/10 p-4 space-y-4 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
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
                            <div className="space-y-1 pl-4 py-2 bg-white/5 rounded-lg">
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  to={subItem.href}
                                  className="block py-2 px-3 text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors"
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
              
              <div className="pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      onSignIn();
                      setIsMenuOpen(false);
                      setOpenDropdowns([]);
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      onSignUp();
                      setIsMenuOpen(false);
                      setOpenDropdowns([]);
                    }}
                    className="w-full bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] text-white hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
