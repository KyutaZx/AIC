import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        freshco: {
          blue:       '#0000FF',
          'blue-hover': '#0000CC',
          page:       '#FFFFFF',
          card:       '#F5F7FF',
          border:     '#E0E6FF',
          ink:        '#0A0A1A',
          sub:        '#4B5563',
          prima:      '#16A34A',
          'prima-bg': '#F0FDF4',
          sedang:     '#D97706',
          'sedang-bg':'#FFFBEB',
          kritis:     '#DC2626',
          'kritis-bg':'#FEF2F2',
        },
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-28px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(48px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.75)' },
          '70%':  { transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            filter: 'drop-shadow(2px 0 0 rgba(0,0,255,0.35)) drop-shadow(-2px 0 0 rgba(0,180,255,0.25))',
          },
          '50%': {
            filter: 'drop-shadow(4px 0 0 rgba(0,0,255,0.6)) drop-shadow(-4px 0 0 rgba(0,200,255,0.5))',
          },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.35s ease-out both',
        'slide-down': 'slide-down 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':   'slide-up 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
        'pop-in':     'pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'spin-slow':  'spin-slow 1s linear infinite',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        sans:   ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
