/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lightgreen: {
          500: '#6FD962',
          600: '#58B44F',
          700: '#418639',
        },
      },
    },
  },
  plugins: [],
}
