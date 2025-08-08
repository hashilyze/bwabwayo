/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
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
      width: {
        'container': 'var(--container-width)',
        'container-wide': 'var(--container-width-wide)',
      },
      maxWidth: {
        'container': 'var(--container-width)',
        'container-wide': 'var(--container-width-wide)',
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}
