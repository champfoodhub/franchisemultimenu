/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#b91c1c',
        secondary: '#f9fafb',
      }
    },
  },
  plugins: [],
}
