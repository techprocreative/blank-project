/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F172A",
          accent: "#22C55E",
          warning: "#FACC15",
          danger: "#EF4444"
        }
      }
    }
  },
  plugins: []
};