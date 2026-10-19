/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        lime: "#0066ff",
        mint: "#0052cc",
        brand: "#0066ff",
        obsidian: "#010320",
        fog: "#9ca3af"
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        levitateFirst: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        levitateSecond: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        }
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        levitate1: 'levitateFirst 6s ease-in-out infinite',
        levitate2: 'levitateSecond 5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
