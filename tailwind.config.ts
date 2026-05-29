import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: "#1B2B2B",
          gold: "#C8A066",
          "gold-light": "#D4B07A",
          stone: "#E7E1D9",
          ivory: "#F6F3EF",
          grey: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards",
        "slide-up": "slide-up 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards",
        "shimmer": "shimmer 1.8s infinite",
        "ken-burns": "ken-burns 18s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.18)", opacity: "0.45" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1.02) translate(0, 0)" },
          "100%": { transform: "scale(1.08) translate(-1%, -1.5%)" },
        },
      },
      letterSpacing: {
        "editorial": "0.32em",
        "wordmark": "0.4em",
      },
    },
  },
  plugins: [],
};

export default config;
