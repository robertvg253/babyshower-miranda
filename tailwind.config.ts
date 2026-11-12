import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        parisienne: ["var(--font-parisienne)", "cursive"],
      },
      colors: {
        "pastel-pink": "#FADADD",
        "pastel-green": "#D4EAC8",
        "pastel-text": "#4A5568",
      },
    },
  },
  plugins: [],
};

export default config;

