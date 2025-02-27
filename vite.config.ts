import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import fs from 'fs';

// Helper function to safely load SSL certificates
const loadSSLCertificates = () => {
  try {
    const certPath = path.resolve(process.cwd(), '.cert');
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

// CSP is now defined in index.html only to avoid conflicts
// Commenting out the generateCSP function to ensure it's not used
/*
const generateCSP = (mode: string) => {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https://raw.githubusercontent.com', 'https://*.cloudflare.com', 'https://images.unsplash.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'http://localhost:3000',
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.supabase.com',
      'https://gnwdahoiauduyncppbdb.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://*.cloudflareinsights.com',
      'https://api.stripe.com',
      'https://js.stripe.com',
      'https://m.stripe.com',
      'https://checkout.stripe.com',
      'http://localhost:*',
      'https://localhost:*',
      'ws://localhost:*',
      'wss://localhost:*',
      'http://127.0.0.1:*',
      'https://127.0.0.1:*'
    ],
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"]
  };

  if (mode === 'development') {
    directives['connect-src'].push('ws://localhost:*', 'wss://localhost:*');
    directives['script-src'].push('https://localhost:*', 'http://localhost:*');
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};
*/

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      }),
      VitePWA({
        registerType: 'prompt',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'service-worker.ts',
        injectRegister: false,
        manifest: {
          name: 'Smart Debt Flow',
          short_name: 'SDF',
          theme_color: '#88B04B',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          sourcemap: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      }),
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        includePublic: true,
      })
    ],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          sourcemapExcludeSources: false,
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          }
        }
      },
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev
        }
      }
    },
    css: {
      devSourcemap: true
    },
    server: {
      https: false,
      headers: {
        // CSP is defined in index.html only to avoid conflicts
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        '@radix-ui/react-dialog',
        '@radix-ui/react-label',
        '@radix-ui/react-slot',
        '@radix-ui/react-toast'
      ],
      exclude: []
    },
    publicDir: 'public',
    base: '/'
  };
});