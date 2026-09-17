import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030910",
          900: "#06121E", // User specified primary dark background
          850: "#091a2b",
          800: "#0d233a",
          700: "#133150",
          600: "#1b426b",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          glow: "#00f2fe",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          glow: "#0df2c9",
        },
        risk: {
          safe: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
        }
      },
      boxShadow: {
        "cyan-glow": "0 0 20px -5px rgba(6, 182, 212, 0.4)",
        "teal-glow": "0 0 20px -5px rgba(20, 184, 166, 0.4)",
        "red-glow": "0 0 25px 0 rgba(239, 68, 68, 0.6)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "radial-dark": "radial-gradient(circle at 50% 0%, #0d2742 0%, #06121E 75%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "cyber-grid": "radial-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 0)",
      },
      animation: {
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
