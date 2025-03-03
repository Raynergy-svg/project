import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { DeviceProvider } from '@/contexts/DeviceContext';
import { ThemeProvider } from '@/utils/theme';

/**
 * Custom render function that includes providers
 * This makes tests more realistic by including the app's context providers
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
  initialEntries?: string[];
}

/**
 * All providers wrapper component
 */
export const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DeviceProvider>
          <SecurityProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SecurityProvider>
        </DeviceProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

/**
 * Custom render method
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: ExtendedRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Mock the Supabase client
 */
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockImplementation((callback) => {
      // Return an unsubscribe function
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  },
  from: vi.fn().mockImplementation((table) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback) => Promise.resolve(callback({ data: [], error: null }))),
  })),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
};

// Re-export everything from testing-library
export * from '@testing-library/react';

/**
 * Wait for a specified time
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock console methods to suppress specific messages during tests
 */
export const mockConsole = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  
  beforeAll(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });
};

/**
 * Mock fetch API
 */
export const mockFetch = (data: any) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      headers: new Headers(),
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: 'https://example.com',
      clone: vi.fn(),
      body: null,
      bodyUsed: false,
      redirected: false,
    })
  );
};

/**
 * Mock date for consistent testing
 */
export const mockDate = (date: Date = new Date('2023-01-01T00:00:00Z')) => {
  const RealDate = Date;
  
  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          return new RealDate(date);
        }
        return new RealDate(...args);
      }
      
      static now() {
        return date.getTime();
      }
    };
  });
  
  afterAll(() => {
    global.Date = RealDate;
  });
}; 