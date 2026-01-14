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
        corporate: {
          primary: "#3b82f6", // oklch(58% 0.158 241.966) - 蓝色主色
          "primary-focus": "#2563eb",
          "primary-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          secondary: "#8b5cf6", // oklch(55% 0.046 257.417) - 紫色次要色
          "secondary-focus": "#7c3aed",
          "secondary-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          accent: "#06b6d4", // oklch(60% 0.118 184.704) - 青色强调色
          "accent-focus": "#0891b2",
          "accent-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          neutral: "#000000", // oklch(0% 0 0) - 黑色中性色
          "neutral-focus": "#1f2937",
          "neutral-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          "base-100": "#ffffff", // oklch(100% 0 0) - 主背景白色
          "base-200": "#f3f4f6", // oklch(93% 0 0) - 次级背景浅灰
          "base-300": "#e5e7eb", // oklch(86% 0 0) - 三级背景灰色
          "base-content": "#374151", // oklch(22.389% 0.031 278.072) - 主文本深灰蓝
          info: "#3b82f6", // oklch(60% 0.126 221.723) - 蓝色信息
          "info-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          success: "#10b981", // oklch(62% 0.194 149.214) - 绿色成功
          "success-content": "#ffffff", // oklch(100% 0 0) - 白色文本
          warning: "#f59e0b", // oklch(85% 0.199 91.936) - 琥珀色警告
          "warning-content": "#000000", // oklch(0% 0 0) - 黑色文本
          error: "#ef4444", // oklch(70% 0.191 22.216) - 红色错误
          "error-content": "#000000", // oklch(0% 0 0) - 黑色文本
          border: "#d1d5db",
          input: "#f3f4f6",
          card: "#ffffff",
          skeleton: "#e5e7eb",
        },
      },
    ],
  },
};
