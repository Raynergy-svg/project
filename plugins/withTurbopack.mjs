/**
 * This plugin enforces Turbopack as the preferred bundler in Next.js
 * It modifies the webpack configuration to use Turbopack when possible
 */

function withTurbopack(nextConfig = {}) {
  return {
    ...nextConfig,
    // Force using the new bundler in development
    experimental: {
      ...nextConfig.experimental,
      turbo: {
        ...(nextConfig.experimental?.turbo || {}),
        rules: {
          // Convert existing loaders to rules using glob pattern format
          ...(nextConfig.experimental?.turbo?.loaders 
            ? Object.entries(nextConfig.experimental.turbo.loaders).reduce((acc, [ext, loader]) => {
                // Convert .ext to *.ext format for compatibility
                const pattern = ext.startsWith('.') ? `*${ext}` : ext;
                acc[pattern] = loader;
                return acc;
              }, {})
            : {}),
          ...(nextConfig.experimental?.turbo?.rules || {}),
        },
        resolve: {
          ...(nextConfig.experimental?.turbo?.resolve || {}),
          preferTurbopack: true,
        },
      },
    },
    // Modify webpack to detect when it's being used instead of Turbopack
    webpack: (config, options) => {
      // Create a webpack plugin that shows a warning when webpack is used
      const webpack = options.webpack;
      const TurbopackDetector = class {
        apply(compiler) {
          compiler.hooks.beforeCompile.tap('TurbopackDetector', () => {
            if (!options.isServer && process.env.NODE_ENV !== 'production') {
              console.warn('\n⚠️ Using webpack instead of Turbopack. For a faster development experience, use --turbo flag\n');
            }
          });
        }
      };

      config.plugins.push(new TurbopackDetector());

      // Call the original webpack config function if it exists
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
}

export default withTurbopack;
