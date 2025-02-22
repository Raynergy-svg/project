import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useScrollProgress,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo"; // Update this import

interface NavbarProps {
  onSignIn: () => void;
  onNavigate: (sectionId: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  onDebtPlannerClick?: () => void;
  onDashboardClick?: () => void;
}

export default function Navbar({
  onSignIn,
  onNavigate,
  isAuthenticated,
  userName,
  onDebtPlannerClick,
  onDashboardClick,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollY, scrollYProgress } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(30, 30, 30, 0)", "rgba(30, 30, 30, 0.95)"]
  );
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const shadowOpacity = useTransform(
    scrollY,
    [0, 100],
    [0, 0.2]
  );

  const navItems = [
    { label: "Features", id: "features-heading" },
    { label: "Methods", id: "visualization-heading" },
    { label: "Pricing", id: "pricing-heading" },
  ];

  return (
    <motion.nav
      style={{ 
        backgroundColor,
        boxShadow: shadowOpacity.get() ? `0 4px 30px rgba(0, 0, 0, ${shadowOpacity.get()})` : 'none'
      }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-white/5"
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#88B04B] origin-[0%]"
        style={{ scaleX }}
      />

      {/* Navbar content */}
      <div className="container relative mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="flex items-center gap-2 z-20"
        >
          <Logo size="sm" />
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={onDebtPlannerClick}
            className="text-white hover:text-[#88B04B] transition-colors"
          >
            Debt Planner
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="text-white hover:text-[#88B04B] transition-colors"
            >
              {item.label}
            </button>
          ))}

          {isAuthenticated ? (
            <>
              <span className="text-white/80">Welcome, {userName}</span>
              <Button
                onClick={onDashboardClick}
                className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-6"
              >
                Dashboard
              </Button>
            </>
          ) : (
            <Button
              onClick={onSignIn}
              className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-6"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 z-20"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-0 top-16 bg-[#1E1E1E] border-t border-white/10 z-10"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <button
                onClick={() => {
                  onDebtPlannerClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#88B04B] py-2 transition-colors"
              >
                Debt Planner
              </button>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-[#88B04B] py-2 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-[#88B04B] py-2 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <Button
                  onClick={() => {
                    onSignIn();
                    setIsMenuOpen(false);
                  }}
                  variant="default"
                  className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
