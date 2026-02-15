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
        bg: {
          deep: "#f0f4f8",
          card: "#ffffff",
          elevated: "#f8fafc",
          hover: "#e8f0fe",
        },
        aurora: {
          cyan: "#00bcd4",
          blue: "#2962ff",
          indigo: "#5c6bc0",
          purple: "#7c4dff",
          teal: "#00bfa5",
        },
        ice: {
          white: "#e8f0fe",
          light: "#b0c4de",
          medium: "#6e8ca0",
          muted: "#3d5a73",
        },
        text: {
          primary: "#1a2332",
          secondary: "#4a6178",
          muted: "#8fa3b8",
        },
      },
      fontFamily: {
        heading: ['"Exo 2"', "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        aurora: "0 10px 50px -15px rgba(41, 98, 255, 0.15), 0 20px 60px -10px rgba(0, 188, 212, 0.1)",
        glass: "0 8px 32px rgba(41, 98, 255, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
      },
      animation: {
        "aurora-breathe": "aurora-breathe 20s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out",
      },
      keyframes: {
        "aurora-breathe": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.6" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)", opacity: "0.8" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)", opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(41, 98, 255, 0.4))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 20px rgba(0, 188, 212, 0.6))" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
