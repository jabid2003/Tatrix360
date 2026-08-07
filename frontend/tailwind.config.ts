import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        success: { DEFAULT: 'hsl(var(--success))', foreground: '0 0% 100%' },
        warning: { DEFAULT: 'hsl(var(--warning))', foreground: '0 0% 100%' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      fontFamily: {
  sans: [
    'var(--font-inter)',
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
  ],
  serif: [
    'var(--font-playfair)',
    'Georgia',
    'serif',
  ],
  mono: [
    'var(--font-mono)',
    'ui-monospace',
    'monospace',
  ],
},
      container: { screens: { '2xl': '1280px' }, padding: '1rem' },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 4px 16px -4px rgb(0 0 0 / 0.04)',
        'glow': '0 0 24px -4px hsl(var(--primary) / 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'in-up': 'in-up 0.5s ease-out both',
        'in-fade': 'in-fade 0.4s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'loading-bar': 'loading-bar 0.8s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'in-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'loading-bar': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '50%': { transform: 'scaleX(1)', transformOrigin: 'left' },
          '51%': { transformOrigin: 'right' },
          '100%': { transform: 'scaleX(0)', transformOrigin: 'right' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
