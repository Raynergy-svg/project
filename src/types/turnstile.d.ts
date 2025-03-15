/**
 * Type definitions for Cloudflare Turnstile
 */
interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  callback: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: (error: any) => void;
  action?: string;
  cData?: string;
  [key: string]: any;
}

interface Turnstile {
  render: (
    container: HTMLElement | string,
    options: TurnstileOptions
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
  getResponse: (widgetId: string) => string | undefined;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
} 