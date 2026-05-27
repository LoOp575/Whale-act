import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark premium palette
        whale: {
          50: "#e6f7ff",
          100: "#b3e0ff",
          200: "#80caff",
          300: "#4db3ff",
          400: "#1a9dff",
          500: "#0080e6",
          600: "#0066b3",
          700: "#004d80",
          800: "#00334d",
          900: "#001a26",
        },
        dark: {
          50: "#f7f8fa",
          100: "#e3e5e8",
          200: "#c8ccd2",
          300: "#9da3ad",
          400: "#6b7280",
          500: "#4b5563",
          600: "#374151",
          700: "#1f2937",
          800: "#111827",
          850: "#0d1117",
          900: "#0a0e14",
          950: "#060810",
        },
        accent: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          violet: "#8b5cf6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(135deg, #0a0e14 0%, #111827 50%, #0d1117 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
