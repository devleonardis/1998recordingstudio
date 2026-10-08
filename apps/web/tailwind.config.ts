import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090D18",
        primary: "#1A1E42",
        secondary: "#262952",
        accent: "#D4853A",
        text: "#E4E2DB",
        ivory: "#C8C6C3",
        brass: "#C8923C",
        muted: "#B8ABA2",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,133,58,0.25), 0 8px 40px rgba(212,133,58,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
