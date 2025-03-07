import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '@/utils/theme';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { theme, colorMode, setColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Handle both mousedown and click events
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('click', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('click', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setColorMode(newMode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Theme: ${theme}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {theme === 'light' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        )}
        {showLabel && <span>{theme === 'light' ? 'Light' : 'Dark'}</span>}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-menu-button"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                colorMode === 'light'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                colorMode === 'dark'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                colorMode === 'system'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 