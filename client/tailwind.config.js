/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#07070c",
          900: "#0c0d14",
          800: "#14151f",
          700: "#1c1e2c",
        },
        gold: {
          50: "#fdf8e9",
          100: "#faefc7",
          200: "#f5dd8f",
          300: "#efc453",
          400: "#eab035",
          500: "#d99a26",
          600: "#bc781e",
          700: "#96581b",
          800: "#7b471d",
          900: "#673c1d",
        },
        cream: "#f5efe6",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.35)",
        "gold-glow": "0 0 40px rgba(234, 176, 53, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "marquee-slow": "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};