/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A2E",
        accent: "#E94560",
        secondary: "#16213E",
        surface: "#0F3460",
        text: "#EAEAEA"
      },
      fontFamily: {
        heading: ["\"Plus Jakarta Sans\"", "system-ui", "sans-serif"],
        body: ["\"DM Sans\"", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

