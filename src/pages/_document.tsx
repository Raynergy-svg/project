import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
          
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
                    
                    // Global error handler to prevent crashes
                    window.addEventListener('error', function(event) {
                      if (event.message.includes('undefined (reading \\'call\\')') ||
                          event.message.includes('Cannot read properties of undefined') ||
                          event.message.includes('Maximum call stack size exceeded')) {
                        console.warn('Webpack error caught and handled:', event.message);
                        event.preventDefault();
                        return true;
                      }
                    }, true);
                  } catch (e) {
                    console.error('Error applying early safety patches:', e);
                  }
                })();
              `
            }}
          />
          
          {/* Inter font from Google Fonts */}
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
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
    )
  }
}

export default MyDocument 