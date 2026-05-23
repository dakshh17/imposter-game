/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        void: '#0a0a0f',
        surface: '#12121a',
        card: '#1a1a26',
        border: '#2a2a3a',
        accent: '#7c6af7',
        'accent-dim': '#5a4fd4',
        amber: '#f59e0b',
        coral: '#f87171',
        teal: '#2dd4bf',
        jade: '#4ade80'
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'glow': 'glow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow: { '0%,100%': { boxShadow: '0 0 20px rgba(124,106,247,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(124,106,247,0.6)' } }
      }
    }
  },
  plugins: []
}
