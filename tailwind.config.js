/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
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
  plugins: [require("daisyui/src/plugin.js")],
};
