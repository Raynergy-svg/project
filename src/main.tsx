import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Initialize performance monitoring
const initializePerformanceMonitoring = () => {
  // Report Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }

  // Monitor network conditions
  if ('connection' in navigator) {
    // @ts-ignore
    const connection = navigator.connection;
    if (connection) {
      console.log(`Network Information:
        - Effective Type: ${connection.effectiveType}
        - Downlink: ${connection.downlink} Mbps
        - RTT: ${connection.rtt} ms
      `);

      connection.addEventListener('change', () => {
        console.log('Network conditions changed');
      });
    }
  }
};

// Preload critical resources
const preloadResources = () => {
  // Preload critical fonts
  const preloadFont = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Preload critical images
  const preloadImage = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  };

  // Add resource hints
  const addResourceHint = (href: string, rel: 'preconnect' | 'dns-prefetch') => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (rel === 'preconnect') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Preload critical resources
  preloadFont('/src/assets/fonts/soehne-buch.woff2');
  preloadImage('/assets/images/hero-bg.webp');

  // Add resource hints for external services
  addResourceHint('https://gnwdahoiauduyncppbdb.supabase.co', 'preconnect');
  addResourceHint('https://gnwdahoiauduyncppbdb.supabase.co', 'dns-prefetch');
};

// Initialize service worker
const initializeServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Let Vite PWA handle the service worker registration
      const { registerSW } = await import('virtual:pwa-register');
      
      registerSW({
        immediate: true,
        onRegistered(registration) {
          console.log('Service worker registration successful');
        },
        onRegisterError(error) {
          console.warn('Service worker registration failed:', error);
        }
      });
    } catch (error) {
      console.warn('Service worker initialization failed:', error);
      // Continue without service worker
    }
  }
};

// Remove initial loader
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
};

// Initialize the application
const initializeApp = () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </StrictMode>
  );

  // Remove loader after app is mounted
  removeInitialLoader();
};

// Initialize everything in the correct order
const initialize = async () => {
  // Start preloading resources immediately
  preloadResources();

  // Initialize monitoring
  initializePerformanceMonitoring();

  // Initialize service worker
  await initializeServiceWorker();

  // Initialize the app
  initializeApp();
};

// Start initialization
initialize();
