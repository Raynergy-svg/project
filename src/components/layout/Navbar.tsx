import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

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
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(30, 30, 30, 0)", "rgba(30, 30, 30, 0.98)"]
  );

  const navItems = [
    { label: "Features", id: "features-heading" },
    { label: "Methods", id: "visualization-heading" },
    { label: "Pricing", id: "pricing-heading" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        style={{ backgroundColor }}
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-2"
          >
            <Logo size="sm" />
          </motion.div>

          <div className="flex items-center gap-6">
            <button
              onClick={onDebtPlannerClick}
              className="text-white/90 hover:text-[#88B04B] transition-colors text-sm font-medium"
            >
              Debt Planner
            </button>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="text-white/90 hover:text-[#88B04B] transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated ? (
              <>
                <span className="text-white/80 text-sm">Welcome, {userName}</span>
                <Button
                  onClick={onDashboardClick}
                  className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-4 py-2 text-sm"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button
                onClick={onSignIn}
                className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-4 py-2 text-sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        style={{ backgroundColor }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="px-4 h-16 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-2 z-50"
          >
            <Logo size="sm" />
          </motion.div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:text-[#88B04B] transition-colors z-50"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[64px] left-0 right-0 bg-[#1E1E1E] border-t border-b border-white/10 z-40 px-4 py-6 shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      onDebtPlannerClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-white/90 hover:text-[#88B04B] py-2 transition-colors text-lg font-medium"
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
                      className="w-full text-left text-white/90 hover:text-[#88B04B] py-2 transition-colors text-lg font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                  {isAuthenticated ? (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-white/60 mb-3">Welcome back, {userName}</p>
                      <Button
                        onClick={() => {
                          onDashboardClick?.();
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3"
                      >
                        Dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        onSignIn();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-[#88B04B] hover:bg-[#7a9d43] text-white py-3 mt-4"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Add top spacing for content */}
      <div className="h-16" />
    </>
  );
}
