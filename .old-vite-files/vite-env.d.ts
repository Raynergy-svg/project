/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_ANON_KEY: string;
  readonly VITE_SERVICE_ROLE_KEY: string;
  readonly VITE_S3_Access_Key: string;
  readonly VITE_S3_Secret_Key: string;
  readonly VITE_S3_Region: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
