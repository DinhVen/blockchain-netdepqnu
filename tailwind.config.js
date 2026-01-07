/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#14B8A6',
        background: '#F8FAFC',
        foreground: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
        'dark-bg': '#0B1220',
        'dark-card': '#111827',
      },
    },
  },
  plugins: [],
};
