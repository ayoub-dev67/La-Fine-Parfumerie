import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette La Fine Parfumerie - Luxe
        noir: {
          DEFAULT: "#0a0a0a",
          50: "#1a1a1a",
          100: "#151515",
          200: "#121212",
          300: "#0f0f0f",
          400: "#0c0c0c",
          500: "#0a0a0a",
          600: "#080808",
          700: "#050505",
          800: "#030303",
          900: "#000000",
        },
        or: {
          DEFAULT: "#c5a059",
          light: "#d4b77a",
          dark: "#a8863d",
          50: "#fdf9f0",
          100: "#f9f0db",
          200: "#f2e0b6",
          300: "#e8cb86",
          400: "#d4b77a",
          500: "#c5a059",
          600: "#a8863d",
          700: "#8a6b2e",
          800: "#6d5324",
          900: "#4f3c1a",
        },
        creme: {
          DEFAULT: "#f5f5f0",
          light: "#fafaf8",
          dark: "#e8e8e0",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gold-shimmer": "linear-gradient(90deg, #c5a059 0%, #d4b77a 50%, #c5a059 100%)",
      },
      boxShadow: {
        luxury: "0 4px 20px rgba(197, 160, 89, 0.15)",
        "luxury-lg": "0 8px 40px rgba(197, 160, 89, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
