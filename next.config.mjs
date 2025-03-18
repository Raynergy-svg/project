// next.config.mjs - optimized for compatibility
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  transpilePackages: ["lucide-react"],

  // Configure image domains using remotePatterns
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Minimal experimental settings
  experimental: {
    // Empty array for swcPlugins to avoid type errors
    swcPlugins: []
  },

  // This webpack config is only used when Turbopack can't be used
  // (Keeping it for fallback compatibility)
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Optimize for faster builds
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    };
    
    return config;
  },
};

export default nextConfig;
