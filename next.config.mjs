// next.config.mjs - optimized for compatibility with Turbopack prioritized
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the withTurbopack plugin (with proper .mjs extension)
const withTurbopack = (await import(join(__dirname, 'plugins', 'withTurbopack.mjs'))).default;

/**
 * Detect Turbopack environment variables
 */
const isForceTurbopack = process.env.FORCE_TURBOPACK === '1';
const isExperimentalTurbopack = process.env.EXPERIMENTAL_TURBOPACK === '1';
const isDisableTurbopack = process.env.DISABLE_TURBOPACK === '1';

// Determine if Turbopack should be used
const useTurbopack = (isForceTurbopack || isExperimentalTurbopack) && !isDisableTurbopack;

// Log Turbopack status during build
console.log(`Next.js config: ${useTurbopack ? 'USING' : 'NOT USING'} Turbopack`);
if (useTurbopack) {
  console.log('Turbopack enabled via:', 
    isForceTurbopack ? 'FORCE_TURBOPACK=1' : 
    isExperimentalTurbopack ? 'EXPERIMENTAL_TURBOPACK=1' : 'unknown');
}

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
      rules: {
        // Configure rules for specific file patterns
        // '*.png': ['file-loader'],
      },
      resolve: {
        // Additional resolve options if needed
        preferTurbopack: true,
      },
    },
    // Force Turbopack to be the default (commented out because it's unsupported)
    // forceSwcTransforms: true,
    // React Server Components are enabled by default in Next.js 13+
    // Enable other experimental features
    swcPlugins: [],
  },

  // This webpack config is only used during production builds
  // or as a fallback when Turbopack can't be used
  webpack: (config, { isServer, dev }) => {
    // Only show a warning in development mode
    if (!isServer && dev) {
      console.warn('⚠️ Development is using webpack instead of Turbopack. For faster development, use `next dev --turbo`');
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
