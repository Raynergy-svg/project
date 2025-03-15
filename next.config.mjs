/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  transpilePackages: ["lucide-react", "framer-motion"],

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
  },

  // Enable compression for faster page load
  compress: true,

  // Configure webpack to support path aliases and exclude react-router-dom
  webpack: (config, { isServer }) => {
    // Add path aliases
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

    // Add bundle analyzer in production build
    if (process.env.ANALYZE === "true") {
      // Note: Dynamic imports in non-async functions need a workaround for webpack
      import("webpack-bundle-analyzer").then(({ BundleAnalyzerPlugin }) => {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "server",
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      });
    }

    return config;
  },

  // Pass environment variables to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_TURNSTILE: process.env.NEXT_PUBLIC_ENABLE_TURNSTILE,
    NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV:
      process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_IN_DEV,
    NEXT_PUBLIC_ENABLE_CAPTCHA: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,

    // Server-side Turnstile variables (needed for API routes)
    TURNSTILE_SITE_KEY:
      process.env.TURNSTILE_SITE_KEY ||
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TURNSTILE_SITE_KEY_DEV:
      process.env.TURNSTILE_SITE_KEY_DEV ||
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_DEV,
    TURNSTILE_SECRET_KEY_DEV: process.env.TURNSTILE_SECRET_KEY_DEV,

    // Dev mode flag
    NODE_ENV: process.env.NODE_ENV,

    // Make sure authentication configuration is accessible
    ENABLE_TURNSTILE: process.env.ENABLE_TURNSTILE,
    ENABLE_TURNSTILE_IN_DEV: process.env.ENABLE_TURNSTILE_IN_DEV,
    ENABLE_CAPTCHA: process.env.ENABLE_CAPTCHA,
  },

  // Configure headers for better security and performance
  async headers() {
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
