/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#88B04B",
          dark: "#6A8F3D",
          light: "#A6C76F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1E1E1E",
          dark: "#171717",
          light: "#2A2A2A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#45B7D1",
          dark: "#3797AD",
          light: "#6FC5DA",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF6B6B",
          dark: "#E65252",
          light: "#FF8A8A",
          foreground: "#FFFFFF",
        },
        background: {
          DEFAULT: "#1E1E1E",
          paper: "#2A2A2A",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.8)",
          disabled: "rgba(255, 255, 255, 0.4)",
        },
        divider: "rgba(255, 255, 255, 0.1)",
        overlay: "rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      screens: {
        xs: "320px",
        sm: "481px",
        md: "769px",
        lg: "1025px",
        xl: "1281px",
        "2xl": "1537px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
