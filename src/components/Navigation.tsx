import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/**
 * Navigation component for the application.
 * This component handles navigation throughout the app.
 *
 * @returns {JSX.Element} The Navigation component
 */
export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMdAndUp } = useBreakpoint();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false); // Close menu when navigating
  };

  // Close menu when switching to desktop view
  React.useEffect(() => {
    if (isMdAndUp && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMdAndUp, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-between p-4">
        <a href="/" className="text-2xl font-bold">
          Smart Debt Flow
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden"
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>

        {/* Desktop Navigation */}
        <div
          className={`hidden md:flex space-x-4 ${
            isMdAndUp ? "flex" : "hidden"
          }`}
        >
          <a
            href="/dashboard"
            className={`hover:text-[#88B04B] ${
              location.pathname === "/dashboard" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/dashboard" ? "page" : undefined
            }
          >
            Dashboard
          </a>
          <a
            href="/debt-planner"
            className={`hover:text-[#88B04B] ${
              location.pathname === "/debt-planner" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/debt-planner" ? "page" : undefined
            }
          >
            Debt Planner
          </a>
          <a
            href="/settings"
            className={`hover:text-[#88B04B] ${
              location.pathname === "/settings" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/settings" ? "page" : undefined
            }
          >
            Settings
          </a>
        </div>

        {/* Sign In/Get Started buttons */}
        <div className="hidden sm:flex space-x-4">
          <button
            onClick={() => handleNavigation("/signup")}
            className="border border-[#88B04B] text-[#88B04B] px-4 py-2 rounded"
          >
            Sign in to your account
          </button>
          <button
            onClick={() => handleNavigation("/signup")}
            className="bg-[#88B04B] text-white px-4 py-2 rounded"
            aria-label="Create a new account"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden p-4" data-testid="mobile-menu">
          <a
            href="/dashboard"
            className={`block py-2 ${
              location.pathname === "/dashboard" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/dashboard" ? "page" : undefined
            }
          >
            Dashboard
          </a>
          <a
            href="/debt-planner"
            className={`block py-2 ${
              location.pathname === "/debt-planner" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/debt-planner" ? "page" : undefined
            }
          >
            Debt Planner
          </a>
          <a
            href="/settings"
            className={`block py-2 ${
              location.pathname === "/settings" ? "text-[#88B04B]" : ""
            }`}
            aria-current={
              location.pathname === "/settings" ? "page" : undefined
            }
          >
            Settings
          </a>
          <button
            onClick={() => handleNavigation("/signup")}
            className="border border-[#88B04B] text-[#88B04B] px-4 py-2 rounded mt-4 w-full"
          >
            Sign in to your account
          </button>
          <button
            onClick={() => handleNavigation("/signup")}
            className="bg-[#88B04B] text-white px-4 py-2 rounded mt-2 w-full"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
