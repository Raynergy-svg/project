// Measure compilation time
const startTime = Date.now();
console.log("Next.js config processing started");

// Basic configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  transpilePackages: ["lucide-react"],

  // Configure image domains using remotePatterns (recommended)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },

  // Enable experimental features for better performance
  experimental: {
    // Use supported formats for experimental features
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
    ],
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // Enhanced Turbopack configuration
    turbo: {
      // Use Rust-based SWC compiler for faster builds
      swc: {
        enabled: true,
      },
      resolveAlias: {
        // Add any aliasing that might be needed
      },
      // Cache settings for faster rebuilds
      cacheSize: 2048, // 2GB cache
    },
    // Remove PPR to avoid canary-only error
    ppr: false,
  },

  // This webpack config is only used when Turbopack can't be used
  // (Keeping it for fallback compatibility)
  webpack: (config, { dev, isServer }) => {
    // If running in turbo mode, skip webpack configuration
    const isTurbo = process.env.NEXT_TURBO === "1";
    if (isTurbo) {
      console.log("Using Turbopack - skipping webpack configuration");
      return config;
    }

    // Add aliases if needed
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };

    // Fix for "Cannot read properties of undefined (reading 'call')"
    if (!isServer) {
      // Define polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Ensure stable module IDs
      config.optimization.moduleIds = "named";
      config.optimization.chunkIds = "named";

      // Fix for React Server Components issue
      config.module.parser = {
        ...config.module.parser,
        javascript: {
          ...config.module.parser?.javascript,
          // Ensure exportsPresence is set correctly
          exportsPresence: "error",
        },
      };

      // Add babel plugins for proper polyfill support
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((r) => {
            if (r.use && Array.isArray(r.use)) {
              r.use.forEach((loader) => {
                if (loader.loader && loader.loader.includes("babel-loader")) {
                  if (!loader.options) loader.options = {};
                  if (!loader.options.plugins) loader.options.plugins = [];

                  // Add babel plugins needed for polyfills
                  loader.options.plugins.push(
                    "@babel/plugin-transform-runtime"
                  );
                }
              });
            }
          });
        }
      });
    }

    if (dev) {
      // Disable optimizations that slow down dev builds
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;

      // Reduce logging
      config.infrastructureLogging = {
        level: "error",
      };
    }

    // Log completion
    console.log(`Webpack config completed in ${Date.now() - startTime}ms`);
    return config;
  },

  // Handle icon imports properly
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
      preventFullImport: true,
    },
  },

  // Reduce file system watching overhead
  onDemandEntries: {
    // Keep generated pages in memory longer (reduces rebuilds)
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // Function to handle redirects - update to match actual App Router paths
  async redirects() {
    return [
      // Remove redirects that would create a loop with App Router pages
      // These are handled by the App Router directly now
    ];
  },

  // Add support for bundle analyzer if requested
  ...(process.env.ANALYZE
    ? {
        bundleAnalyzer: {
          enabled: true,
          openAnalyzer: true,
        },
      }
    : {}),
};

// Log total configuration time
console.log(`Next.js config processed in ${Date.now() - startTime}ms`);

export default nextConfig;
