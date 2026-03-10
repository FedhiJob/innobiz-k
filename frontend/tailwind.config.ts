import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#1E1C1B",
          olive: "#4E705D",
          blue: "#1E5AA7",
          green: "#4E705D",
          yellow: "#F4BF00",
          red: "#C23A3A",
          slate: "#1E1C1B",
        },
      },
      boxShadow: {
        panel: "0 8px 30px rgba(11, 93, 167, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
