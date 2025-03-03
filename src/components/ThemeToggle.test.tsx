import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider, useTheme } from '@/utils/theme';

// Mock the theme context
vi.mock('@/utils/theme', async () => {
  const actual = await vi.importActual('@/utils/theme');
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});

describe('ThemeToggle Component', () => {
  const mockToggleTheme = vi.fn();
  const mockSetColorMode = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useTheme as any).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      colorMode: 'light',
      setColorMode: mockSetColorMode,
    });
  });
  
  it('renders correctly in light mode', () => {
    renderWithProviders(<ThemeToggle />);
    
    // Check that the button is rendered
    const button = screen.getByRole('button', { name: /theme: light/i });
    expect(button).toBeInTheDocument();
    
    // Check that the sun icon is visible (light mode)
    const svgElement = button.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
  
  it('renders correctly in dark mode', () => {
    // Override the mock to return dark theme
    (useTheme as any).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      colorMode: 'dark',
      setColorMode: mockSetColorMode,
    });
    
    renderWithProviders(<ThemeToggle />);
    
    // Check that the button is rendered
    const button = screen.getByRole('button', { name: /theme: dark/i });
    expect(button).toBeInTheDocument();
    
    // Check that the moon icon is visible (dark mode)
    const svgElement = button.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
  
  it('opens the menu when clicked', async () => {
    renderWithProviders(<ThemeToggle />);
    
    // Get the button and click it
    const button = screen.getByRole('button', { name: /theme: light/i });
    fireEvent.click(button);
    
    // Check that the menu is visible
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
    });
  });
  
  it('calls setColorMode when a theme option is selected', async () => {
    renderWithProviders(<ThemeToggle />);
    
    // Open the menu
    const button = screen.getByRole('button', { name: /theme: light/i });
    fireEvent.click(button);
    
    // Click the dark mode option
    const darkOption = await screen.findByRole('menuitem', { name: /dark/i });
    fireEvent.click(darkOption);
    
    // Check that setColorMode was called with 'dark'
    expect(mockSetColorMode).toHaveBeenCalledWith('dark');
    
    // Menu should be closed after selection
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
  
  it('closes the menu when clicking outside', async () => {
    renderWithProviders(<ThemeToggle />);
    
    // Open the menu
    const button = screen.getByRole('button', { name: /theme: light/i });
    fireEvent.click(button);
    
    // Menu should be visible
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    
    // Click outside the menu
    fireEvent.click(document.body);
    
    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
  
  it('closes the menu when pressing Escape', async () => {
    renderWithProviders(<ThemeToggle />);
    
    // Open the menu
    const button = screen.getByRole('button', { name: /theme: light/i });
    fireEvent.click(button);
    
    // Menu should be visible
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
  
  it('displays label when showLabel prop is true', () => {
    renderWithProviders(<ThemeToggle showLabel={true} />);
    
    // Check that the label is visible
    expect(screen.getByText('Light')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    renderWithProviders(<ThemeToggle className="custom-class" />);
    
    // Check that the custom class is applied
    const container = screen.getByRole('button', { name: /theme: light/i }).parentElement;
    expect(container).toHaveClass('custom-class');
  });
}); 