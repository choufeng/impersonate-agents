/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx", "./**/*.ts", "./**/*.html"],
  theme: {
    extend: {
      colors: {
        abyss: {
          DEFAULT: "#2C3047",
          50: "#0f172a",
          100: "#712629",
          200: "#27272f",
          300: "#334155",
          400: "#475569",
          500: "#64748b",
          600: "#718096",
          700: "#818998",
          800: "#9333ea",
          900: "#a8a29e",
          950: "#c2410c",
        },
      },
    },
  },
  plugins: [require("daisyui/src/index.js")],
  daisyui: {
    themes: [
      {
        abyss: {
          primary: "#2C3047",
          "primary-focus": "#1e1b4b",
          "primary-content": "#ffffff",
          secondary: "#0f172a",
          "secondary-focus": "#334155",
          "secondary-content": "#ffffff",
          accent: "#6366f1",
          "accent-focus": "#8b5cf6",
          "accent-content": "#ffffff",
          neutral: "#2c3047",
          "neutral-focus": "#1e1b4b",
          "neutral-content": "#ffffff",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#e2e8f0",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          border: "#334155",
          input: "#1e293b",
          card: "#1e293b",
          skeleton: "#334155",
        },
      },
    ],
  },
};
