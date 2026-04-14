/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0A0A0F',
          secondary: '#0F1118',
          tertiary:  '#13111F',
        },
        accent: {
          amber:  '#F59E0B',
          pink:   '#EC4899',
          purple: '#8B5CF6',
          green:  '#10B981',
          cyan:   '#06B6D4',
          orange: '#F97316',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        widest2: '0.08em',
      },
      boxShadow: {
        'glow-amber':  '0 0 20px rgba(245,158,11,0.35)',
        'glow-pink':   '0 0 20px rgba(236,72,153,0.35)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.35)',
        'glow-green':  '0 0 20px rgba(16,185,129,0.35)',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #F59E0B, #EC4899)',
        'gradient-mesh':    'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 50%, #110A1F 100%)',
        'gradient-surface': 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
      },
    },
  },
  plugins: [],
}
