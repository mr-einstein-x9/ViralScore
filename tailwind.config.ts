import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e6fff4",
          100: "#b3ffe1",
          200: "#80ffcd",
          300: "#4dffb9",
          400: "#1affa5",
          500: "#00ff87",
          600: "#00cc6c",
          700: "#009951",
          800: "#006636",
          900: "#00331b",
          950: "#001a0d",
        },
        surface: {
          50:  "#fafafa",
          100: "#f5f5f5",
          900: "#0a0a0a",
          950: "#050505",
        },
        viral: "#00ff87",
        hot:   "#ff3d00",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body:    ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "spin-slow":   "spin 3s linear infinite",
        "pulse-glow":  "pulseGlow 2s ease-in-out infinite",
        "slide-up":    "slideUp 0.5s ease forwards",
        "fade-in":     "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 8px 2px rgba(0, 255, 135, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 20px 6px rgba(0, 255, 135, 0.8)",
          },
        },
        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
