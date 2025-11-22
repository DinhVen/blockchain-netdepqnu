/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        qnu: {
          500: '#005BBB',
          600: '#004a99',
        },
      },
    },
  },
  plugins: [],
};
