/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 50: "#f0f0f0", 100: "#d6d6d6", 200: "#adadad", 300: "#858585", 400: "#5c5c5c", 500: "#333333", 600: "#292929", 700: "#1f1f1f", 800: "#141414", 900: "#0a0a0a", 950: "#050505" },
        accent: { 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
      },
    },
  },
  plugins: [],
};
