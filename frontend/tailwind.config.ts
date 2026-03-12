import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#1E1E1E",
          black: "#1E1E1E",
          blue: "#056EDC",
          blueDark: "#0A46B4",
          green: "#28C3BE",
          greenDark: "#009BAA",
          yellow: "#FFC300",
          orange: "#FF8700",
          red: "#FF8700",
          slate: "#1E1E1E",
        },
      },
      boxShadow: {
        panel: "0 18px 50px rgba(5, 110, 220, 0.12), 0 2px 8px rgba(30, 30, 30, 0.06)",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
