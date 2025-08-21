import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Waukesha Lodge Branding Colors
        "lodge-navy": "#00274D",
        "lodge-gold": "#FFB81C",
        "lodge-white": "#FFFFFF",
        "lodge-gray-light": "#F5F5F5",
        "lodge-gray-border": "#CCCCCC",
        "lodge-error": "#CC0000",
        "lodge-success": "#2E7D32",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        serif: ["Merriweather", "Lora", "serif"],
        sans: ["Open Sans", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
