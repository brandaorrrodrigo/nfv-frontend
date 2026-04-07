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
        // ── Sem prefixo (usados em body/base) ──────────────────────
        bg: {
          deep:     "#f0f4f8",
          card:     "#ffffff",
          elevated: "#f8fafc",
          hover:    "#e8f0fe",
        },
        text: {
          primary:   "#1a2332",
          secondary: "#4a6178",
          muted:     "#8fa3b8",
        },
        aurora: {
          cyan:   "#00bcd4",
          blue:   "#2962ff",
          indigo: "#5c6bc0",
          purple: "#7c4dff",
          teal:   "#00bfa5",
        },

        // ── Prefixo nfv- (usados em todos os componentes) ──────────
        nfv: {
          // Cyan principal — text-nfv-cyan, bg-nfv-cyan, border-nfv-cyan
          cyan: "#00bcd4",

          // Aurora azul — bg-nfv-aurora, text-nfv-aurora, shadow-nfv
          aurora: "#2962ff",

          // Ice = textos escuros sobre fundo claro
          // text-nfv-ice        → quase preto azulado
          // text-nfv-ice-light  → azul médio escuro
          // text-nfv-ice-medium → cinza azulado médio
          // text-nfv-ice-muted  → cinza azulado suave
          ice: {
            DEFAULT: "#1a2332",
            light:   "#2d4a6b",
            medium:  "#4a6178",
            muted:   "#6e8ca0",
          },

          // Backgrounds
          bg: {
            deep:     "#f0f4f8",
            card:     "#ffffff",
            elevated: "#f8fafc",
            hover:    "#e8f0fe",
          },

          // Semânticas
          success: "#00c853",
          warning: "#ff9100",
          danger:  "#ff1744",
          info:    "#00b0ff",
        },
      },

      fontFamily: {
        heading: ['"Exo 2"', "system-ui", "sans-serif"],
        body:    ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "monospace"],
      },

      fontSize: {
        // Sobrescreve xs para nunca ser menor que 12px
        xs:   ["0.75rem",  { lineHeight: "1.1rem"  }],
        sm:   ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem",     { lineHeight: "1.5rem"  }],
      },

      boxShadow: {
        // shadow-nfv e shadow-nfv-glow usados nos componentes
        nfv:          "0 4px 24px rgba(41, 98, 255, 0.12), 0 1px 4px rgba(0,0,0,0.06)",
        "nfv-glow":   "0 0 24px rgba(0, 188, 212, 0.25), 0 4px 24px rgba(41, 98, 255, 0.15)",
        "nfv-frost":  "0 2px 12px rgba(41, 98, 255, 0.06)",
        aurora:       "0 10px 50px -15px rgba(41, 98, 255, 0.15), 0 20px 60px -10px rgba(0, 188, 212, 0.1)",
        glass:        "0 8px 32px rgba(41, 98, 255, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
      },

      animation: {
        "aurora-breathe":   "aurora-breathe 20s ease-in-out infinite",
        "float":            "float 6s ease-in-out infinite",
        "shimmer":          "shimmer 2s linear infinite",
        "glow-pulse":       "glow-pulse 3s ease-in-out infinite",
        "nfv-glow-pulse":   "glow-pulse 3s ease-in-out infinite",
        "fade-up":          "fade-up 0.5s ease-out",
      },

      keyframes: {
        "aurora-breathe": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.6" },
          "33%":      { transform: "translate(30px, -30px) scale(1.1)", opacity: "0.8" },
          "66%":      { transform: "translate(-20px, 20px) scale(0.9)", opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1",   filter: "drop-shadow(0 0 8px rgba(41, 98, 255, 0.4))" },
          "50%":      { opacity: "0.8", filter: "drop-shadow(0 0 20px rgba(0, 188, 212, 0.6))" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
