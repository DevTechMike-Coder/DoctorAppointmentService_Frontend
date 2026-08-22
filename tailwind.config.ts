import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10161C",
        canvas: "#F7F8FA",
        teal: {
          DEFAULT: "#0F6E5C",
          dark: "#0B5747",
          light: "#E4EFEC",
        },
        rust: "#C4433D",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;