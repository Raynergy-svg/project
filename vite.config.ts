import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { getCSP } from './src/config/csp';

// Helper function to safely load SSL certificates
const loadSSLCertificates = () => {
  try {
    return {
      key: fs.readFileSync('certs/key.pem'),
      cert: fs.readFileSync('certs/cert.pem'),
    };
  } catch (error) {
    console.warn('SSL certificates not found, falling back to HTTP');
    return false;
  }
};

const sslCertificates = loadSSLCertificates();

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get Supabase URL from environment variable or use a default for development
  const supabaseUrl = env.VITE_SUPABASE_URL || (
    mode === 'development' 
      ? 'http://localhost:54321'
      : 'https://gnwdahoiauduyncppbdb.supabase.co'
  );

  // Warn about missing environment variable in production
  if (!env.VITE_SUPABASE_URL && mode === 'production') {
    console.warn('Warning: VITE_SUPABASE_URL environment variable is not set. Using default value.');
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      ...(sslCertificates && {
        https: sslCertificates
      }),
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/functions/v1': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/functions\/v1/, '/functions/v1'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Forward the authorization and apikey headers from the original request
              const authHeader = req.headers['authorization'];
              const apiKey = req.headers['apikey'];
              
              if (authHeader) {
                proxyReq.setHeader('Authorization', authHeader);
              }
              if (apiKey) {
                proxyReq.setHeader('apikey', apiKey);
              }
            });
          }
        }
      },
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      },
      headers: {
        'Content-Security-Policy': getCSP(supabaseUrl),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, x-supabase-auth',
        'Access-Control-Allow-Credentials': 'true'
      },
      watch: {
        usePolling: true,
      },
    },
    preview: {
      ...(sslCertificates && {
        https: sslCertificates
      }),
      host: true,
      port: 5173,
      strictPort: true,
      headers: {
        'Content-Security-Policy': getCSP(supabaseUrl),
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['framer-motion'],
            ui: ['lucide-react', '@supabase/supabase-js'],
          },
        },
      },
      target: 'esnext',
      minify: 'esbuild',
    },
  };
});