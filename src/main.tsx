import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "@/empty-module";
import App from "./App";
import "./index.css";
import { initSecurityAuditService } from "./services/securityAuditService";

// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Explicitly set production flag - this will be tree-shaken in production build
window.IS_PRODUCTION =
  import.meta.env.PROD || import.meta.env.MODE === "production";
console.log("App running in production mode:", window.IS_PRODUCTION);

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error || event.message);

  // Try to remove loader in case of error
  const loader = document.getElementById("initial-loader");
  if (loader && loader.parentNode) {
    console.warn("Removing loader after error");
    loader.parentNode.removeChild(loader);
  }
});

// Detect slow resource loading - only in development
const detectSlowResources = () => {
  if (!isDevelopment) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // If a resource takes more than 3 seconds to load, log it
      if (entry.duration > 3000) {
        console.warn(
          `Slow resource: ${entry.name} took ${entry.duration}ms to load`
        );
      }
    }
  });

  try {
    observer.observe({ entryTypes: ["resource"] });
  } catch (e) {
    console.error("PerformanceObserver not supported:", e);
  }
};

// Remove initial loader - with multiple fallbacks and debugging
const removeInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    if (isDevelopment) console.log("Removing initial loader");

    // Try multiple approaches to ensure it's removed
    try {
      // First set display to none for immediate visual hiding
      loader.style.display = "none";
      if (isDevelopment) console.log("Set loader display to none");

      // Then set opacity and remove it after animation
      loader.style.opacity = "0";
      if (isDevelopment) console.log("Set loader opacity to 0");

      // Finally remove from DOM
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
          if (isDevelopment) console.log("Removed loader from DOM");
        }
      }, 300);
    } catch (e) {
      console.error("Error removing loader:", e);
      // Fallback if the above fails
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
        if (isDevelopment) console.log("Used fallback method to remove loader");
      }
    }
  } else if (isDevelopment) {
    console.warn("Initial loader element not found");
  }
};

// Add debug info to page - only in development
const addDebugInfo = () => {
  if (!isDevelopment) {
    return {
      update: (_text: string) => {
        /* No-op in production */
      },
    };
  }

  const debugDiv = document.createElement("div");
  debugDiv.style.position = "fixed";
  debugDiv.style.bottom = "0";
  debugDiv.style.right = "0";
  debugDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
  debugDiv.style.color = "#00FF00";
  debugDiv.style.padding = "5px";
  debugDiv.style.fontSize = "10px";
  debugDiv.style.fontFamily = "monospace";
  debugDiv.style.zIndex = "9999";
  debugDiv.textContent = "DEBUG: App initializing...";

  document.body.appendChild(debugDiv);

  return {
    update: (text: string) => {
      debugDiv.textContent = `DEBUG: ${text} (${new Date().toLocaleTimeString()})`;
    },
  };
};

// Determine if we're running in the browser
const isBrowser = typeof window !== "undefined";

// Initialize the application with better error handling
const initializeApp = () => {
  const debugInfo = addDebugInfo();
  if (isDevelopment) debugInfo.update("Finding root element");

  const root = document.getElementById("root");
  if (!root) {
    if (isDevelopment) debugInfo.update("ERROR: Root element not found");
    console.error("Root element not found");
    return;
  }

  if (isDevelopment) debugInfo.update("Preparing to render React app");

  try {
    if (isDevelopment) debugInfo.update("Creating React root");
    const reactRoot = createRoot(root);

    if (isDevelopment) debugInfo.update("Rendering App component");

    // Only use BrowserRouter on the client side
    // This prevents issues during server-side rendering
    reactRoot.render(
      <StrictMode>
        {isBrowser ? (
          <BrowserRouter>
            <App />
          </BrowserRouter>
        ) : (
          <App />
        )}
      </StrictMode>
    );

    if (isDevelopment) debugInfo.update("React render called");

    // Remove loader after a short delay to ensure React has started rendering
    setTimeout(() => {
      removeInitialLoader();
      if (isDevelopment) debugInfo.update("App initialized successfully");
    }, 100);
  } catch (e) {
    if (isDevelopment)
      debugInfo.update(
        `ERROR: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    console.error("Error initializing app:", e);
    removeInitialLoader(); // Try to remove loader even if app fails
  }
};

// Enable debugging with query parameter, but only in development
const isDebugMode =
  isDevelopment && new URLSearchParams(window.location.search).has("debug");
if (isDebugMode) {
  console.log("Debug mode enabled");
  detectSlowResources();
}

// Initialize security services without blocking the app startup
setTimeout(() => {
  // Try to initialize the security service but don't block the app if it fails
  initSecurityAuditService()
    .then(() => {
      console.log("Security audit service initialized successfully");
    })
    .catch((error) => {
      // Just log the error and let the app continue
      console.warn(
        "Security audit service initialization failed, but app will continue:",
        error
      );
    });
}, 1000); // Short delay to allow other critical services to initialize first

// Start immediately
initializeApp();

// Extra safety - ensure loader is removed even if something above fails
window.addEventListener("load", () => {
  if (isDevelopment) console.log("Window load event fired");
  setTimeout(removeInitialLoader, 1000);
});
