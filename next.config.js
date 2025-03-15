/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);

// Determine if we're in development mode
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  transpilePackages: ["lucide-react", "framer-motion"],
  swcMinify: true,

  // Configure image domains using remotePatterns (recommended)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 1 minute cache
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Re-enable server minification in development for faster builds
    serverMinification: !isDev,
    // Speed up development builds
    webpackBuildWorker: isDev,

    // Simplified and correct Turbopack specific configuration
    turbo: {
      // Define resolvers for path aliases
      resolveAlias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Simple configuration for module resolution
      resolve: {
        alias: {
          "@supabase/ssr": path.resolve(
            __dirname,
            "node_modules/@supabase/ssr/dist/module/index.js"
          ),
        },
        // Tell Turbopack about module resolution strategies
        preferEsm: true,
      },
    },
  },

  // Enable compression for faster page load
  compress: true,

  // Disable middleware to avoid RequestCookies issue
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,

  // Configure webpack to support path aliases and exclude react-router-dom
  webpack: (config, { dev, isServer }) => {
    // Basic path aliases configuration - this is fast
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };

    // Replace react-router-dom with empty module to prevent it from being bundled
    config.resolve.alias["react-router-dom"] = path.resolve(
      __dirname,
      "./src/empty-module.js"
    );
    config.resolve.alias["react-router"] = path.resolve(
      __dirname,
      "./src/empty-module.js"
    );

    // Ensure optional chaining (?.) is transpiled for the server
    if (isServer) {
      if (Array.isArray(config.module.rules)) {
        // Find the rule that handles JavaScript/TypeScript files
        const jsRule = config.module.rules.find(
          (rule) => rule.test && rule.test.test(".tsx")
        );

        if (jsRule && jsRule.use && Array.isArray(jsRule.use)) {
          // Find the babel-loader or swc-loader configuration
          const loaderConfig = jsRule.use.find(
            (use) =>
              use.loader &&
              (use.loader.includes("babel-loader") ||
                use.loader.includes("swc-loader"))
          );

          if (loaderConfig && loaderConfig.options) {
            // Add the optional chaining plugin if using babel
            if (
              loaderConfig.loader.includes("babel-loader") &&
              loaderConfig.options.plugins
            ) {
              loaderConfig.options.plugins.push(
                "@babel/plugin-proposal-optional-chaining"
              );
            }

            // For SWC, ensure the optional chaining is handled
            if (
              loaderConfig.loader.includes("swc-loader") &&
              loaderConfig.options.jsc
            ) {
              if (!loaderConfig.options.jsc.transform) {
                loaderConfig.options.jsc.transform = {};
              }

              loaderConfig.options.jsc.transform.useDefineForClassFields = false;
              loaderConfig.options.jsc.transform.react = {
                ...loaderConfig.options.jsc.transform.react,
                runtime: "automatic",
              };

              // Ensure optional chaining is correctly handled
              if (!loaderConfig.options.jsc.parser) {
                loaderConfig.options.jsc.parser = {
                  syntax: "typescript",
                  tsx: true,
                  decorators: false,
                  dynamicImport: true,
                };
              }

              loaderConfig.options.jsc.target = "es2019"; // Safely below optional chaining support
            }
          }
        }
      }
    }

    // Create a targeted fix for the specific error
    const factoryCallPatch = `
// Targeted patch for "Cannot read properties of undefined (reading 'call')" at line 712
(function() {
  // Override the webpack runtime directly at the exact point of failure
  var wpRequire = __webpack_require__;
  var originalModule = wpRequire.m[712]; // Target the specific line causing the error
  
  if (originalModule) {
    wpRequire.m[712] = function(module, exports, __webpack_require__) {
      try {
        // Add safety check for options.factory
        var originalFactory = Function.prototype.toString;
        Function.prototype.toString = function() {
          try {
            return originalFactory.apply(this, arguments);
          } catch (e) {
            return "function() {}";
          }
        };
        
        // Add safety check for all function calls
        var originalCall = Function.prototype.call;
        Function.prototype.call = function() {
          if (!this) return undefined;
          return originalCall.apply(this, arguments);
        };
        
        // Run the original module with our safety net in place
        var result = originalModule.apply(this, arguments);
        
        // Restore original methods
        Function.prototype.toString = originalFactory;
        Function.prototype.call = originalCall;
        
        return result;
      } catch (e) {
        console.warn('Prevented webpack runtime error:', e);
        return {};
      }
    };
  }
  
  // Also patch the specific factory method call error
  var originalFactory = Function.prototype.apply;
  Function.prototype.apply = function(thisArg, args) {
    if (this === undefined || this === null) {
      console.warn('Prevented call on undefined function');
      return undefined;
    }
    return originalFactory.call(this, thisArg, args);
  };
})();
`;

    // Minimal patch for any webpack runtime, applying directly to all JS files
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.afterCompile.tap(
          "WebpackRuntimePatch",
          (compilation) => {
            // Grab a reference to webpack RuntimeModule
            const RuntimeModule = compiler.webpack.RuntimeModule;

            // Register a handler to intercept chunk loading
            compiler.hooks.thisCompilation.tap(
              "WebpackRuntimePatch",
              (compilation) => {
                compilation.hooks.processAssets.tap(
                  {
                    name: "WebpackRuntimePatch",
                    stage:
                      compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
                  },
                  (assets) => {
                    // Apply our patch to ALL webpack runtime files
                    Object.keys(assets).forEach((name) => {
                      if (name.includes("webpack") && name.endsWith(".js")) {
                        let content = assets[name].source();

                        // Direct patch for webpack factory call issue (line 712)
                        content = content.replace(
                          /options\.factory\(r,\s*o\.exports,\s*o,\s*e\)/g,
                          '(options && typeof options.factory === "function") ? options.factory(r, o.exports, o, e) : undefined'
                        );

                        // Direct patch for function.call issue
                        content = content.replace(
                          /(\w+)\.call\(([^)]+)\)/g,
                          '$1 && typeof $1.call === "function" ? $1.call($2) : undefined'
                        );

                        // Add safety around all webpack requires
                        content = content.replace(
                          /__webpack_require__\(\s*moduleId\s*\)/g,
                          "moduleId ? __webpack_require__(moduleId) : {}"
                        );

                        // Replace optional chaining with standard property access
                        content = content.replace(
                          /(\w+)\?\.(\w+)/g,
                          "$1 && $1.$2"
                        );

                        // Insert our patch at the beginning of the file
                        content = `${factoryCallPatch}\n${content}`;

                        compilation.updateAsset(
                          name,
                          new compiler.webpack.sources.RawSource(content)
                        );
                      }
                    });
                  }
                );
              }
            );
          }
        );
      },
    });

    // Patch all JS files to replace optional chaining with safe property access
    config.plugins.push({
      apply(compiler) {
        // This plugin will modify all JS files to replace optional chaining
        compiler.hooks.thisCompilation.tap(
          "ReplaceOptionalChainingPlugin",
          (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: "ReplaceOptionalChainingPlugin",
                stage:
                  compiler.webpack.Compilation
                    .PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
              },
              (assets) => {
                // Process all JavaScript files
                Object.keys(assets).forEach((name) => {
                  if (name.endsWith(".js")) {
                    let content = assets[name].source();

                    // Replace optional chaining with standard property access
                    content = content.replace(/(\w+)\?\.(\w+)/g, "$1 && $1.$2");

                    // Replace nested optional chaining
                    content = content.replace(
                      /(\w+) && (\w+)\.(\w+)\?\.(\w+)/g,
                      "$1 && $2.$3 && $2.$3.$4"
                    );

                    compilation.updateAsset(
                      name,
                      new compiler.webpack.sources.RawSource(content)
                    );
                  }
                });
              }
            );
          }
        );
      },
    });

    return config;
  },

  // Pass environment variables to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_TURNSTILE: process.env.NEXT_PUBLIC_ENABLE_TURNSTILE,
    NEXT_PUBLIC_ENABLE_CAPTCHA: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configure headers for better security and performance
  async headers() {
    // Create a comprehensive CSP that works in both development and production
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.cloudflareinsights.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' data: https://fonts.gstatic.com;
      img-src 'self' blob: data: https:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://*.cloudflareinsights.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel.com;
      frame-src 'self' https://challenges.cloudflare.com;
      worker-src 'self' blob:;
      child-src 'self' blob: data:;
      media-src 'self' data:;
      object-src data: 'self';
      form-action 'self';
      frame-ancestors 'self';
      base-uri 'self';
      report-to document-write;
      report-uri https://localhost:3000/api/csp-report;
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // Improved Content Security Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // Preconnect to Cloudflare to speed up Turnstile loading
          {
            key: "Link",
            value:
              "<https://challenges.cloudflare.com>; rel=preconnect; crossorigin=anonymous",
          },
          // Set SameSite cookie policy
          {
            key: "Set-Cookie",
            value: "SameSite=Lax; Secure",
          },
          // Add reporting group for document.write
          {
            key: "Report-To",
            value:
              '{"group":"document-write","max_age":10886400,"endpoints":[{"url":"https://localhost:3000/api/csp-report"}],"include_subdomains":true}',
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
