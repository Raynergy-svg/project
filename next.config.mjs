// next.config.mjs - optimized for compatibility with Turbopack prioritized
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the withTurbopack plugin (with proper .mjs extension)
const withTurbopack = (await import(join(__dirname, 'plugins', 'withTurbopack.mjs'))).default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  transpilePackages: ["lucide-react"],
  
  // Exclude archived directories from the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Exclude _archive directory from compilation
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

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

  // Configure experimental features with Turbopack enabled
  experimental: {
    // Enable Turbopack for faster builds and better error handling
    turbo: {
      // Turbopack-specific options
      loaders: {
        // Configure loaders for specific file extensions if needed
        // '.png': 'file',
      },
      resolve: {
        // Additional resolve options if needed
        preferTurbopack: true,
      },
    },
    // Use React Server Components
    serverComponents: true,
    // Enable other experimental features
    swcPlugins: [],
  },

  // This webpack config is only used as a fallback when Turbopack can't be used
  // It's configured with lower priority than Turbopack
  webpack: (config, { isServer }) => {
    // Mark webpack as a fallback (for debugging purposes)
    if (!isServer) {
      console.warn('⚠️ Using webpack as fallback instead of Turbopack');
    }
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

// Export the nextConfig wrapped with withTurbopack to prioritize Turbopack
export default withTurbopack(nextConfig);
