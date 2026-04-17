/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#0F1118',
          tertiary: '#13111F',
        },
        accent: {
          amber:  '#F59E0B',
          green:  '#10B981',
          pink:   '#EC4899',
          purple: '#8B5CF6',
          cyan:   '#06B6D4',
          orange: '#F97316',
        },
      },
    },
  },
  plugins: [],
}
