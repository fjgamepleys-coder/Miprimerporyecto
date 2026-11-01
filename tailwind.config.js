/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f0c',
        surface: '#101814',
        'surface-2': '#18221d',
        emerald: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#34d399',
        },
        gold: {
          DEFAULT: '#d4a017',
          dark: '#a67c12',
          light: '#e6c34a',
        },
        earth: {
          DEFAULT: '#a16207',
          light: '#c2852d',
        },
        accent: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        warning: '#fbbf24',
        danger: '#ef4444',
        cream: '#f5ecd9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '480px',
      },
      borderColor: {
        weave: 'rgba(212, 160, 23, 0.25)',
      },
    },
  },
  plugins: [],
};
