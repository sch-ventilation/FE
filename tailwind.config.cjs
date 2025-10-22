// ...existing code...
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}"
  ],
  safelist: [
    'bg-zinc-50'
  ],
  theme: {
    extend: {
      colors: {
        zinc: colors.zinc ?? colors.gray
      }
    },
  },
  plugins: [],
};