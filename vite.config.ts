import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { getCSP } from './src/config/csp';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const supabaseUrl = env.VITE_SUPABASE_URL || (
    mode === 'development' 
      ? 'http://localhost:54321'
      : 'https://gnwdahoiauduyncppbdb.supabase.co'
  );

  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (mode === 'production') {
    if (!env.VITE_SUPABASE_URL) {
      console.warn('Warning: VITE_SUPABASE_URL environment variable is not set');
    }
    if (!env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Warning: VITE_SUPABASE_ANON_KEY environment variable is not set');
    }
  }

  const csp = getCSP(supabaseUrl);

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      })
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      origin: 'http://localhost:5173',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
        clientPort: 5173
      },
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/functions/v1': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/functions\/v1/, '/functions/v1'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const authHeader = req.headers['authorization'];
              const apiKey = req.headers['apikey'];
              if (authHeader) proxyReq.setHeader('Authorization', authHeader);
              if (apiKey) proxyReq.setHeader('apikey', apiKey);
            });
          }
        }
      },
      cors: true,
      headers: {
        'Content-Security-Policy': csp,
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      }
    },
    preview: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      origin: 'http://localhost:5173',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      },
      headers: {
        'Content-Security-Policy': csp,
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
      cssMinify: 'lightningcss',
      modulePreload: {
        polyfill: true
      },
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
    },
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    }
  };
});