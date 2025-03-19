/**
 * React Server Components client-side patch
 * This patches turbopack/webpack to handle client-side RSC rendering issues
 */

if (typeof window !== 'undefined') {
  // Fix for "__TURBOPACK__imported__module__" not a function
  const patchImportedModule = () => {
    try {
      // Add stub for missing polyfills
      // @ts-ignore
      window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = 
        window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ || {};
        
      // If initPolyfills doesn't exist, create a stub for it
      if (window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__.initPolyfills === undefined) {
        window.__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$polyfills$2e$ts__$5b$client$5d$__$28$ecmascript$29$__.initPolyfills = function() {
          console.warn('Stub initPolyfills called');
        };
      }
    } catch (e) {
      console.warn('Error setting up turbopack polyfill patches:', e);
    }
  };

  // Patch websocket handling
  const patchWebSocket = () => {
    try {
      // Monkey patch the WebSocket prototype to handle undefined messages
      const originalHandleMessage = WebSocket.prototype.handleMessage;
      if (originalHandleMessage) {
        WebSocket.prototype.handleMessage = function patchedHandleMessage(event: any) {
          try {
            // Safely parse the message and provide defaults
            if (event && event.data) {
              const data = JSON.parse(event.data);
              if (data && data.action === undefined) {
                data.action = 'unknown';
              }
              // Reserialize to ensure 'action' exists
              event.data = JSON.stringify(data);
            }
            return originalHandleMessage.call(this, event);
          } catch (e) {
            console.warn('Error in WebSocket message handling:', e);
            // Continue without error
            return undefined;
          }
        };
      }
    } catch (e) {
      console.warn('Error patching WebSocket:', e);
    }
  };

  // Apply patches with a small delay to ensure window is fully loaded
  setTimeout(() => {
    patchImportedModule();
    patchWebSocket();
  }, 0);
} 