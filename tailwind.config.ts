import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#10223f",
        ink: "#13233a",
        primary: "#0b63ce",
        "primary-dark": "#084fa8",
        health: "#12a63a",
        "health-soft": "#e9f8ee",
        "line-soft": "#d7e3f4",
        "panel-soft": "#f7faff",
        "warning-soft": "#fff7df"
      },
      boxShadow: {
        panel: "0 8px 28px rgba(16, 34, 63, 0.08)",
        card: "0 2px 10px rgba(16, 34, 63, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
