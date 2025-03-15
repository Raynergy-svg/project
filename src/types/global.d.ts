// Declare global types
interface Window {
  // Cloudflare Turnstile integration
  turnstile?: {
    render: (
      container: HTMLElement | string,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: (error: any) => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
        [key: string]: any;
      }
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
    getResponse: (widgetId: string) => string | undefined;
  };
  
  // Environment variables - see also env.d.ts for full definitions
  __ENV?: EnvVariables;
  __NEXT_DATA__?: {
    props?: {
      pageProps?: {
        env?: Record<string, string>;
      };
    };
  };
  
  // Auth-related environment variables that might be set directly on window
  SUPABASE_AUTH_CAPTCHA_DISABLE?: boolean;
  SKIP_AUTH_CAPTCHA?: boolean;
  NEXT_PUBLIC_SUPABASE_AUTH_CAPTCHA_DISABLE?: boolean;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  
  // Analytics and tracking functions - using more generic types for flexibility
  gtag?: (command: string, ...args: any[]) => void;
  fbq?: (action: string, ...args: any[]) => void;
} 