interface Window {
  ENV?: {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    ENVIRONMENT?: string;
    [key: string]: string | undefined;
  };
} 