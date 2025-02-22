import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calculator, Settings, LogIn, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMdAndUp } = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    if (isMdAndUp) {
      setIsMenuOpen(false);
    }
  }, [isMdAndUp]);

  const menuItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      to: "/debt-planner",
      icon: <Calculator className="w-5 h-5" />,
      label: "Debt Planner",
    },
    {
      to: "/settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
    },
  ];

  const handleSignIn = () => {
    navigate('/signup');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#1E1E1E] border-b border-white/10 relative z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center px-4 py-2 rounded-lg text-white/80 hover:text-[#88B04B] hover:bg-white/5 transition-all duration-300"
                aria-current={location.pathname === item.to ? 'page' : undefined}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignIn}
              className="hidden sm:flex items-center border-2 border-[#88B04B] text-[#88B04B] hover:bg-[#88B04B] hover:text-white transition-all duration-300"
              aria-label="Sign in to your account"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              onClick={handleGetStarted}
              className="hidden sm:flex bg-[#88B04B] hover:bg-[#88B04B]/90 text-white shadow-lg"
              aria-label="Create a new account"
            >
              Get Started
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#88B04B] hover:bg-[#88B04B]/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#1E1E1E] border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:text-[#88B04B] hover:bg-white/5 transition-all duration-300"
                  aria-current={location.pathname === item.to ? 'page' : undefined}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#88B04B] text-[#88B04B] hover:bg-[#88B04B] hover:text-white transition-all duration-300"
                  aria-label="Sign in to your account"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full justify-center bg-[#88B04B] hover:bg-[#88B04B]/90 text-white shadow-lg"
                  aria-label="Create a new account"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}