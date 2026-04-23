// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Point crucial : scanne ton dossier app
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Point optionnel mais conseillé
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;