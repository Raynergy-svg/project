import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSignIn: () => void;
  isAuthenticated: boolean;
  userName?: string;
  onDashboardClick: () => void;
}

export default function Navbar({
  onSignIn,
  isAuthenticated,
  userName,
  onDashboardClick
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const navItems = [
    { id: 'features', label: 'Features', type: 'scroll' },
    { id: 'debt-management', label: 'Methods', type: 'scroll' },
    { id: 'pricing', label: 'Pricing', type: 'scroll' }
  ];

  const handleNavigation = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Add a small delay to allow the page to load before scrolling
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
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sign In / Dashboard Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                onClick={onDashboardClick}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={onSignIn}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
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
              <Menu className="h-6 w-6" />
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
              className="absolute top-16 left-0 right-0 bg-black/90 border-t border-white/10 p-4 space-y-4 z-50"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    onDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    onSignIn();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
