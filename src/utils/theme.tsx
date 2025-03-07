import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorMode = 'light' | 'dark' | 'system';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  toggleTheme: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const savedMode = localStorage.getItem('theme');
    return (savedMode as ColorMode) || 'system';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (colorMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return colorMode === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (colorMode === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode]);

  useEffect(() => {
    localStorage.setItem('theme', colorMode);
    
    if (colorMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    } else {
      setTheme(colorMode === 'dark' ? 'dark' : 'light');
    }
    
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [colorMode, theme]);

  const toggleTheme = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, colorMode, toggleTheme, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 