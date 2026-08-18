/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: '#E73F1E',
          orange: '#FB6C00',
          amber: '#F9B637',
          peach: '#FFDD9C',
          primary: '#FB6C00',
          dark: '#E73F1E',
          light: '#F9B637',
        }
      }
    },
  },
  plugins: [],
}
