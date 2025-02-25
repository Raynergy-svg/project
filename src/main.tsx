import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Preload only critical fonts
const preloadCriticalFonts = () => {
  // Check if the Soehne font is used in any stylesheet
  const isFontUsed = () => {
    if (!document.styleSheets) return false;
    
    try {
      return Array.from(document.styleSheets).some(sheet => {
        try {
          // Check if the font is referenced in any CSS rules
          const rules = Array.from(sheet.cssRules || []);
          return rules.some(rule => 
            rule.cssText && rule.cssText.includes('Soehne')
          );
        } catch (e) {
          // Skip checking inaccessible stylesheets (e.g., cross-origin)
          return false;
        }
      });
    } catch (e) {
      return false;
    }
  };

  // Only preload if the font is actually used
  if (isFontUsed()) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = "/src/assets/fonts/soehne-buch.woff2";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
};

// Add scroll event listener for auto-hiding scrollbar with debounce
let scrollTimer: number;
let isScrolling = false;

function handleScroll() {
  if (!isScrolling) {
    document.body.classList.add("scrolling");
    isScrolling = true;
  }

  // Clear any existing timer
  if (scrollTimer) {
    window.clearTimeout(scrollTimer);
  }

  // Set new timer to remove the class after 1 second of no scrolling
  scrollTimer = window.setTimeout(() => {
    document.body.classList.remove("scrolling");
    isScrolling = false;
  }, 1000);
}

// Add scroll event listener with passive flag for better performance
window.addEventListener("scroll", handleScroll, { passive: true });

// Show scrollbar on mouse move near the edges with debounce
let mouseMoveTimer: number;
let isNearEdge = false;

function handleMouseMove(e: MouseEvent) {
  const edgeThreshold = 50; // pixels from the edge
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;

  const nearEdge =
    clientX > innerWidth - edgeThreshold ||
    clientY > innerHeight - edgeThreshold;

  if (nearEdge && !isNearEdge) {
    document.body.classList.add("scrolling");
    isNearEdge = true;

    if (mouseMoveTimer) {
      window.clearTimeout(mouseMoveTimer);
    }

    mouseMoveTimer = window.setTimeout(() => {
      document.body.classList.remove("scrolling");
      isNearEdge = false;
    }, 1000);
  }
}

window.addEventListener("mousemove", handleMouseMove, { passive: true });

// Initialize performance monitoring
if ("connection" in navigator) {
  // @ts-ignore
  const connection = navigator.connection;
  if (connection) {
    console.log(`Network Information:
      - Effective Type: ${connection.effectiveType}
      - Downlink: ${connection.downlink} Mbps
      - RTT: ${connection.rtt} ms
    `);
  }
}

// Initialize font preloading after stylesheets are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCriticalFonts);
} else {
  preloadCriticalFonts();
}

// Initialize the app with React 19 features
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

// Use React 19's new concurrent features and automatic batching
root.render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
