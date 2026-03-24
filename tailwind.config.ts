import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e879a0',
        accent: '#f59e0b',
      },
      animation: {
        flicker: 'flicker 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { transform: 'scaleY(1) rotate(-2deg)', opacity: '1' },
          '25%': { transform: 'scaleY(1.15) rotate(3deg)', opacity: '0.9' },
          '50%': { transform: 'scaleY(0.85) rotate(-4deg)', opacity: '0.95' },
          '75%': { transform: 'scaleY(1.1) rotate(2deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
