interface Window {
  ENV?: {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    ENVIRONMENT?: string;
    [key: string]: string | undefined;
  };
  
  // hCaptcha global object
  hcaptcha?: {
    render: (container: string | HTMLElement, params: any) => number;
    remove: (id: number) => void;
    execute: (id?: number) => void;
    reset: (id?: number) => void;
    getResponse: (id?: number) => string;
    getRespKey: (id?: number) => string;
    renderCaptcha: (container: HTMLElement) => void;
    cleanup: () => void;
  };
  
  // Our custom function to retry loading hCaptcha
  retryHCaptchaLoad?: () => void;
} 