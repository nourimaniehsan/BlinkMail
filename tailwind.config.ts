import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050711",
        panel: "rgba(255, 255, 255, 0.075)",
        line: "rgba(255, 255, 255, 0.12)",
      },
      boxShadow: {
        glow: "0 0 60px rgba(79, 70, 229, 0.28)",
      },
      animation: {
        "soft-pulse": "softPulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        softPulse: {
          "0%, 100%": { opacity: "0.68" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

