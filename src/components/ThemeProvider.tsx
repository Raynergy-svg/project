'use client';

import { createContext, useState, useEffect, useContext } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  systemTheme: "dark" | "light";
}

const initialState: ThemeContextValue = {
  theme: "system",
  setTheme: () => null,
  isDark: false,
  systemTheme: "light",
};

const ThemeContext = createContext<ThemeContextValue>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(storageKey, defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");
  
  // Initially set the theme and systemTheme
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Check for system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemIsDark = mediaQuery.matches;
    
    setSystemTheme(systemIsDark ? "dark" : "light");
    
    // Remove old theme classes
    root.classList.remove("light", "dark");
    
    // Add the correct theme class
    if (theme === "system") {
      root.classList.add(systemIsDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
    
    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      
      if (theme === "system") {
        root.classList.remove("light", "dark");
        root.classList.add(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);
  
  // Calculate if currently in dark mode
  const isDark = theme === "system" 
    ? systemTheme === "dark" 
    : theme === "dark";
  
  // Value to pass to context consumers
  const value = {
    theme,
    setTheme,
    isDark,
    systemTheme,
  };
  
  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};

export default ThemeProvider; 