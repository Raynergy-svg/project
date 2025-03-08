import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import fs from 'fs';

// Import our security config
import { securityConfig } from './src/lib/security/config';

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

// Generate CSP using our centralized security config
const generateCSP = (mode: string) => {
  return securityConfig.csp.generate(mode === 'production' ? 'production' : 'development');
};

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
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'logo.svg', 'icons/icon-64x64.png', 'icons/icon-192x192.png', 'icons/icon-512x512.png', 'icons/maskable-icon-512x512.png'],
        manifest: {
          name: 'Smart Debt Flow',
          short_name: 'DebtFlow',
          description: 'Manage and track your debt payoff journey',
          theme_color: '#0A0A0A',
          icons: [
            {
              src: '/icons/icon-64x64.png',
              sizes: '64x64',
              type: 'image/png'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icons/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        useCredentials: false,
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          sourcemap: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
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
        input: isDev 
          ? {
              main: path.resolve(__dirname, 'index.html'),
              debug: path.resolve(__dirname, 'debug.html'),
            }
          : {
              main: path.resolve(__dirname, 'index.html'),
            },
        output: {
          sourcemapExcludeSources: false,
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast'],
            'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js']
          }
        },
        external: ['next/headers'],
        treeshake: {
          moduleSideEffects: (id, external) => {
            return !id.includes('debug') || external;
          }
        }
      },
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
          pure_funcs: isDev ? [] : [
            'console.log', 
            'console.debug', 
            'console.trace'
          ],
          global_defs: {
            DEBUG: isDev
          }
        }
      }
    },
    css: {
      devSourcemap: true
    },
    server: {
      https: sslCertificates,
      headers: {
        'Content-Security-Policy': generateCSP(mode),
      },
      proxy: {
        '/api/ai': {
          target: 'https://curly-tooth-d4a2.projectdcertan84workersdev.workers.dev',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, '/api/ai'),
          configure: (proxy, options) => {
            // Add error logging
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
              
              // Send a more helpful error response to the client
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                });
                
                const json = {
                  success: false,
                  error: 'AI service proxy error',
                  message: isDev ? err.message : 'Failed to connect to AI service',
                  // For development, include the stack for debugging
                  ...(isDev ? { stack: err.stack } : {})
                };
                
                res.end(JSON.stringify(json));
              }
            });
          }
        },
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
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
        '@radix-ui/react-toast',
        'axios',
        '@stripe/react-stripe-js',
        '@stripe/stripe-js'
      ],
      exclude: ['next/headers']
    },
    publicDir: 'public',
    base: '/'
  };
});