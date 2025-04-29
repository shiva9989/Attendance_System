/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // scans all JS/JSX/TS/TSX files in src folder
    "./index.html"                 // scans your index.html file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

