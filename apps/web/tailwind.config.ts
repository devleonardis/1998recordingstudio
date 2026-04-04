import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0C1013",
        primary: "#1D1B3A",
        secondary: "#262952",
        accent: "#CD7948",
        text: "#E4E2DB",
        muted: "#B8ABA2",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(205,121,72,0.25), 0 8px 40px rgba(205,121,72,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
