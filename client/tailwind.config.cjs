/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F5F7FB",
        accent: "#2563EB",
        secondary: "#FFFFFF",
        surface: "#E8EEF8",
        text: "#0F172A"
      },
      fontFamily: {
        heading: ["\"Plus Jakarta Sans\"", "system-ui", "sans-serif"],
        body: ["\"DM Sans\"", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

