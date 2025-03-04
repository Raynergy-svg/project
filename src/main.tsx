import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { registerSW } from "virtual:pwa-register";
import { initSecurityAuditService } from './services/securityAuditService';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
  onRegisteredSW(swUrl, registration) {
    console.log(`Service Worker registered: ${swUrl}`);
  },
  onRegisterError(error) {
    console.error("Service worker registration error:", error);
  },
});

// Debug flag for production logging
const DEBUG = true;

/**
 * Safely logs messages in both development and production
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 * @param {'log'|'warn'|'error'} level - Log level
 */
function safeLog(message: string, data?: any, level: 'log' | 'warn' | 'error' = 'log') {
  try {
    if (DEBUG || import.meta.env.DEV) {
      if (data) {
        console[level](`[SmartDebtFlow] ${message}`, data);
      } else {
        console[level](`[SmartDebtFlow] ${message}`);
      }
    }
  } catch (e) {
    // Silent fail for logging
  }
}

/**
 * Removes the initial loader element with multiple fallback strategies
 */
function removeInitialLoader() {
  try {
    safeLog("Attempting to remove initial loader");
    const loader = document.getElementById("initial-loader");
    
    if (!loader) {
      safeLog("Loader element not found, may have been already removed");
      return;
    }
    
    // Strategy 1: Set display to none
    safeLog("Strategy 1: Setting display to none");
    loader.style.display = "none";
    
    // Strategy 2: Fade out with opacity
    safeLog("Strategy 2: Fading out with opacity");
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    
    // Strategy 3: Remove from DOM after transition
    setTimeout(() => {
      try {
        safeLog("Strategy 3: Removing from DOM");
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
          safeLog("Loader successfully removed from DOM");
        }
      } catch (e) {
        safeLog("Error removing loader from DOM", e, 'error');
      }
    }, 600);
  } catch (e) {
    safeLog("Error removing initial loader", e, 'error');
    
    // Final fallback: Try direct DOM manipulation
    try {
      document.body.classList.add('app-loaded');
      const loader = document.querySelector('#initial-loader');
      if (loader) {
        loader.remove();
      }
    } catch (err) {
      safeLog("All loader removal strategies failed", err, 'error');
    }
  }
}

/**
 * Initialize the application with error handling
 */
async function initializeApp() {
  try {
    safeLog("Initializing application");
    
    // Get the root element
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    safeLog("Root element found, creating React root");
    const root = ReactDOM.createRoot(rootElement);
    
    safeLog("Rendering React application");
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </React.StrictMode>
    );
    
    safeLog("React application rendered successfully");
    
    // Remove the initial loader
    removeInitialLoader();
    
    safeLog("Application initialization complete");
  } catch (error) {
    safeLog("Error initializing application", error, 'error');
    
    // Display error message to user
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h1 style="color: #e53e3e;">Application Error</h1>
          <p>We're experiencing technical difficulties. Please try refreshing the page.</p>
          ${DEBUG ? `<pre style="text-align: left; background: #f7fafc; padding: 1rem; border-radius: 0.25rem;">${error instanceof Error ? error.message : String(error)}</pre>` : ''}
        </div>
      `;
    }
    
    // Still try to remove the loader
    removeInitialLoader();
  }
}

// Start the application
initializeApp();

// Safety timeout to ensure loader is removed even if app fails to initialize
setTimeout(() => {
  const loader = document.getElementById("initial-loader");
  if (loader && loader.style.display !== "none") {
    safeLog("Safety timeout: Forcing loader removal after 10s", null, 'warn');
    removeInitialLoader();
  }
}, 10000);

// Enable debugging with query parameter, but only in development
const isDebugMode = import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug');
if (isDebugMode) {
  console.log('Debug mode enabled');
  detectSlowResources();
}

// Initialize security services without blocking the app startup
setTimeout(() => {
  // Try to initialize the security service but don't block the app if it fails
  initSecurityAuditService()
    .then(() => {
      console.log('Security audit service initialized successfully');
    })
    .catch(error => {
      // Just log the error and let the app continue
      console.warn('Security audit service initialization failed, but app will continue:', error);
    });
}, 1000); // Short delay to allow other critical services to initialize first

// Detect slow resource loading - only in development
const detectSlowResources = () => {
  if (!import.meta.env.DEV) return;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // If a resource takes more than 3 seconds to load, log it
      if (entry.duration > 3000) {
        console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms to load`);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    console.error('PerformanceObserver not supported:', e);
  }
};
