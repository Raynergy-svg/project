"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "outline" | "subtle" | "icon";
}

export function ThemeToggle({
  className,
  variant = "default",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={className}
        aria-label="Toggle theme"
      >
        <motion.div
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.3 }}
          key={theme}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </motion.div>
      </Button>
    );
  }

  if (variant === "subtle") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`flex items-center gap-2 ${className}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          key={theme}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </motion.div>
        {theme === "light" ? "Dark mode" : "Light mode"}
      </Button>
    );
  }

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className={`flex items-center gap-2 ${className}`}
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          key={theme}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </motion.div>
        {theme === "light" ? "Dark mode" : "Light mode"}
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      variant={theme === "dark" ? "outline" : "default"}
      size="sm"
      onClick={toggleTheme}
      className={`flex items-center gap-2 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, rotate: -30 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
        key={theme}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </motion.div>
      {theme === "light" ? "Dark mode" : "Light mode"}
    </Button>
  );
}
