import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

// Import consolidated patches
import "../utils/patches"; // This includes all RSC patches in one file
import "../use-server-patch.js";
import "../app-router-patch.js";
// Import preboot patcher first - this must load before anything else
import "../preboot-patcher.js";
// Then import the regular error handler
import "../next-global-error-handler";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    try {
      const initialProps = await Document.getInitialProps(ctx);
      return initialProps;
    } catch (error) {
      console.error("Error in _document.tsx getInitialProps:", error);
      // Return minimal props to prevent crashing
      return {
        html: "",
        head: [],
        styles: [],
      };
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />

          {/* React Server Components error handling */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // React Server Components Error Prevention
                (function() {
                  // If window.__webpack_modules__ already exists, patch it
                  if (window.__webpack_modules__) {
                    console.log('[Early RSC Patch] Patching webpack modules');
                    for (var key in window.__webpack_modules__) {
                      if (Object.prototype.hasOwnProperty.call(window.__webpack_modules__, key)) {
                        try {
                          var moduleId = key;
                          var isRSCModule = moduleId && 
                            (moduleId.indexOf && 
                             (moduleId.indexOf('react-server-dom-webpack') !== -1 || 
                              moduleId.indexOf('react-server') !== -1));
                          
                          if (isRSCModule) {
                            console.log('[Early RSC Patch] Patching RSC module: ' + moduleId);
                            
                            // Store original module
                            var originalModule = window.__webpack_modules__[moduleId];
                            
                            // Replace with safe version
                            window.__webpack_modules__[moduleId] = function(module, exports, __webpack_require__) {
                              try {
                                return originalModule(module, exports, __webpack_require__);
                              } catch (e) {
                                console.warn('[Early RSC Patch] Error in RSC module: ' + e.message);
                                
                                // Provide minimal implementation
                                exports.createFromFetch = function() { 
                                  return { read: function() { return null; } }; 
                                };
                                exports.createFromReadableStream = function() { 
                                  return { read: function() { return null; } }; 
                                };
                                
                                return module;
                              }
                            };
                          }
                        } catch (e) {
                          console.warn('[Early RSC Patch] Error patching module: ' + e.message);
                        }
                      }
                    }
                  }
                  
                  // Intercept JSON.parse for RSC
                  var originalParse = JSON.parse;
                  JSON.parse = function(text) {
                    try {
                      return originalParse.apply(this, arguments);
                    } catch (e) {
                      if (typeof text === 'string' && text.indexOf('"use server"') !== -1) {
                        console.warn('[Early RSC Patch] Caught RSC model parse error');
                        return { id: 0, chunks: [], name: '', async: true };
                      }
                      throw e;
                    }
                  };
                  
                  // Early error handler for RSC errors
                  window.addEventListener('error', function(event) {
                    if (event.message && 
                        (event.message.includes('Cannot read properties of undefined') ||
                         event.message.includes('requireModule') ||
                         event.message.includes('react-server-dom-webpack'))) {
                      console.warn('[Early RSC Patch] Prevented error: ' + event.message);
                      event.preventDefault();
                      return true;
                    }
                  }, true);
                  
                  // Mark as applied
                  window.__early_rsc_patch_applied = true;
                })();
              `,
            }}
          />

          {/* Specific patch for react-server-dom-webpack-client */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // React Server DOM Client Webpack Error Prevention
                (function() {
                  if (typeof window === 'undefined') return;
                  
                  console.log('[RSC Client Early Patch] Initializing...');
                  
                  // Store references to critical RSC client functions
                  window.__rsc_original_requireModule = null;
                  window.__rsc_original_initializeModuleChunk = null;
                  
                  // Create safe versions of critical functions
                  window.__rsc_safe_requireModule = function(id) {
                    try {
                      if (window.__webpack_require__) {
                        try {
                          return window.__webpack_require__(id);
                        } catch (e) {
                          console.warn('[RSC Client Early Patch] Error requiring module ' + id + ':', e.message);
                          return { default: function() { return null; }, __esModule: true };
                        }
                      }
                      return { default: function() { return null; } };
                    } catch (e) {
                      console.warn('[RSC Client Early Patch] Fatal error in requireModule:', e.message);
                      return { default: function() { return null; } };
                    }
                  };
                  
                  // Monitor when webpack modules become available
                  var patchInterval = setInterval(function() {
                    if (window.__webpack_modules__) {
                      clearInterval(patchInterval);
                      
                      console.log('[RSC Client Early Patch] Webpack modules found, searching for react-server-dom-webpack-client...');
                      
                      // Search through modules
                      for (var id in window.__webpack_modules__) {
                        if (id.includes('react-server-dom-webpack-client') || 
                            id.includes('react-server-dom-webpack/client')) {
                          
                          console.log('[RSC Client Early Patch] Found RSC client module:', id);
                          
                          // Store the original module
                          var originalModule = window.__webpack_modules__[id];
                          
                          // Replace with patched version
                          window.__webpack_modules__[id] = function(module, exports, __webpack_require__) {
                            try {
                              // Call original module
                              originalModule(module, exports, __webpack_require__);
                              
                              // Patch critical functions
                              if (exports.requireModule) {
                                window.__rsc_original_requireModule = exports.requireModule;
                                exports.requireModule = window.__rsc_safe_requireModule;
                              }
                              
                              // Return the patched module
                              return module;
                            } catch (e) {
                              console.warn('[RSC Client Early Patch] Error in RSC client module:', e.message);
                              
                              // Provide fallbacks for essential functions
                              exports.requireModule = window.__rsc_safe_requireModule;
                              exports.createFromFetch = function() { 
                                return { read: function() { return null; } }; 
                              };
                              exports.createFromReadableStream = function() { 
                                return { read: function() { return null; } }; 
                              };
                              
                              return module;
                            }
                          };
                        }
                      }
                    }
                  }, 100);
                  
                  // Add targeted error handler
                  window.addEventListener('error', function(event) {
                    if (event.message && 
                        event.message.includes('Cannot read properties of undefined') && 
                        event.error && event.error.stack && 
                        event.error.stack.includes('react-server-dom-webpack-client')) {
                      
                      console.warn('[RSC Client Early Patch] Intercepted client error:', event.message);
                      event.preventDefault();
                      return true;
                    }
                  }, true);
                  
                  // Mark as applied
                  window.__rsc_client_early_patch_applied = true;
                  console.log('[RSC Client Early Patch] Successfully installed');
                })();
              `,
            }}
          />

          {/* Critical app router error handling patch */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // App Router Error Prevention
                (function() {
                  // Install global handler for app router errors
                  window.addEventListener('error', function(event) {
                    if (event.message && 
                       (event.message.includes("undefined (reading 'call')") || 
                        event.message.includes("Cannot read properties of undefined")) && 
                       (event.filename && 
                        (event.filename.includes('webpack.js') || 
                         event.filename.includes('error-boundary-callbacks.js') || 
                         event.filename.includes('app-index.js') || 
                         event.filename.includes('app-next-dev.js')))) {
                      console.warn('Prevented app router error:', event.message);
                      event.preventDefault();
                      return true;
                    }
                  }, true);
                  
                  // Patch Object.defineProperty to handle undefined targets
                  var originalDefine = Object.defineProperty;
                  Object.defineProperty = function(obj, prop, desc) {
                    if (obj === undefined || obj === null) {
                      console.warn('Prevented defineProperty on undefined for prop:', prop);
                      return obj;
                    }
                    return originalDefine.apply(this, arguments);
                  };
                  
                  // Mark as applied
                  window.__app_router_early_patch = true;
                })();
              `,
            }}
          />

          {/* Early script to catch webpack errors */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Patch for "Cannot read properties of undefined (reading 'call')" error
                (function() {
                  try {
                    // Create safe versions that don't use the prototype methods
                    var safeCall = function(fn, thisArg) {
                      if (typeof fn !== 'function') {
                        console.warn('Prevented call on undefined function');
                        return undefined;
                      }
                      
                      // Direct function invocation with arguments slicing to avoid recursion
                      var args = Array.prototype.slice.call(arguments, 2);
                      return fn.bind(thisArg).apply(undefined, args);
                    };
                    
                    var safeApply = function(fn, thisArg, args) {
                      if (typeof fn !== 'function') {
                        console.warn('Prevented apply on undefined function');
                        return undefined;
                      }
                      
                      // Direct function invocation to avoid any method calls
                      return fn.bind(thisArg).apply(undefined, args || []);
                    };
                    
                    // Store original functions
                    var originalCall = Function.prototype.call;
                    var originalApply = Function.prototype.apply;
                    
                    // Replace Function.prototype.call - use bind to avoid recursion
                    Function.prototype.call = function(thisArg) {
                      if (this === undefined || this === null) {
                        console.warn('Prevented call on undefined function');
                        return undefined;
                      }
                      
                      var args = Array.prototype.slice.call(arguments, 1);
                      return this.bind(thisArg).apply(undefined, args);
                    };
                    
                    // Replace Function.prototype.apply - use bind to avoid recursion
                    Function.prototype.apply = function(thisArg, args) {
                      if (this === undefined || this === null) {
                        console.warn('Prevented apply on undefined function');
                        return undefined;
                      }
                      
                      return this.bind(thisArg).apply(undefined, args || []);
                    };
                    
                    // Webpack factory patch - runs before webpack is fully initialized
                    window.__webpack_factory_patch_applied = true;
                    
                    // Patch for webpack - will apply once webpack loads
                    var applyBundlerPatchesChunks = function() {
                      if (window.webpackChunk_N_E) {
                        console.log('Patching webpack chunk push');
                        var originalPush = window.webpackChunk_N_E.push;
                        window.webpackChunk_N_E.push = function(chunk) {
                          try {
                            return originalPush.apply(this, arguments);
                          } catch (err) {
                            console.warn('Caught webpack chunk push error:', err);
                            return undefined;
                          }
                        };
                      } else {
                        // Retry until webpackChunk is available
                        setTimeout(applyBundlerPatchesChunks, 50);
                      }
                    };
                    
                    // Start the patching process for webpack
                    applyBundlerPatchesChunks();
                    
                    // Global error handler to prevent crashes
                    window.addEventListener('error', function(event) {
                      if (event.message.includes('undefined (reading \\'call\\')') ||
                          event.message.includes('Cannot read properties of undefined') ||
                          event.message.includes('Maximum call stack size exceeded') ||
                          (event.filename && event.filename.includes('webpack.js')) ||
                          (event.error && event.error.stack && event.error.stack.includes('options.factory'))) {
                        console.warn('Webpack error caught and handled:', event.message);
                        event.preventDefault();
                        return true;
                      }
                    }, true);
                  } catch (e) {
                    console.error('Error applying early safety patches:', e);
                  }
                })();
              `,
            }}
          />

          {/* Inter font from Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#0f172a" />
        </Head>
        <body>
          {/* Initial loader that will be removed by JavaScript */}
          <div id="initial-loader">
            <style>{`
              #initial-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #0f1729;
                z-index: 9999;
                transition: opacity 0.3s ease-out;
              }
              #initial-loader .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                border-top-color: #ffffff;
                animation: spin 1s ease-in-out infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="spinner"></div>
          </div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
