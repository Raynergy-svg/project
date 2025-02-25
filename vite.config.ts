import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import fs from 'fs';

// Helper function to safely load SSL certificates
const loadSSLCertificates = () => {
  try {
    const certPath = path.resolve(process.cwd(), 'certs');
    return {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    };
  } catch (error) {
    console.warn('SSL certificates not found, falling back to HTTP');
    return null;
  }
};

const sslCertificates = loadSSLCertificates();

// Generate CSP
const generateCSP = (mode: string) => {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https://raw.githubusercontent.com', 'https://*.cloudflare.com', 'https://images.unsplash.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.supabase.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://*.cloudflareinsights.com',
      'http://localhost:*',
      'https://localhost:*',
      'ws://localhost:*',
      'wss://localhost:*'
    ],
    'frame-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"]
  };

  // Add development-specific sources
  if (mode === 'development') {
    directives['connect-src'].push('ws://localhost:*', 'wss://localhost:*');
    directives['script-src'].push('https://localhost:*', 'http://localhost:*');
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const supabaseUrl = env.VITE_SUPABASE_URL || (
    mode === 'development' 
      ? 'http://localhost:54321'
      : 'https://gnwdahoiauduyncppbdb.supabase.co'
  );
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  const isHttps = !!sslCertificates;
  const protocol = isHttps ? 'https' : 'http';
  const wsProtocol = isHttps ? 'wss' : 'ws';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          sourcemap: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
        },
        manifest: {
          name: 'Smart Debt Flow',
          short_name: 'DebtFlow',
          description: 'Manage and track your debt payoff journey',
          theme_color: '#0A0A0A',
          background_color: '#0A0A0A',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png'
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      }),
      ViteImageOptimizer()
    ],
    optimizeDeps: {
      include: ['lucide-react'],
      exclude: [],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      ...(sslCertificates ? {
        https: sslCertificates,
      } : {}),
      host: true,
      hmr: {
        protocol: wsProtocol,
        host: 'localhost',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/functions/v1': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
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
        'Content-Security-Policy': generateCSP(mode),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        'Access-Control-Allow-Credentials': 'true',
        ...(isDev ? {
          'Service-Worker-Allowed': '/'
        } : {})
      },
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: 5173,
      strictPort: true,
      ...(sslCertificates ? {
        https: sslCertificates,
      } : {}),
      host: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
            'utils-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge'],
            'icons': ['lucide-react']
          },
        },
      },
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      chunkSizeWarningLimit: 1000
    },
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    }
  };
});