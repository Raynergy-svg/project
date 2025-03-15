// Detect which bundler is being used
const isTurbopack = process.env.TURBOPACK === "true";

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Optimize autoprefixer settings for better performance
      flexbox: "no-2009",
      // Turbopack tends to work better with slightly different settings
      ...(isTurbopack ? { grid: "autoplace" } : {}),
    },
  },
};
