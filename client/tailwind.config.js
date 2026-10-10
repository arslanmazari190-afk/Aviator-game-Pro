/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviator: {
          bg: '#0e1015',
          card: '#14171f',
          surface: '#1b1f2b',
          border: '#262b3a',
          red: '#e51e38',
          'red-hover': '#c9142c',
          green: '#28a745',
          'green-hover': '#218838',
          gold: '#f39c12',
          purple: '#9b59b6',
          blue: '#3498db',
          dark: '#090b0e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(229, 30, 56, 0.6))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(229, 30, 56, 1))' }
        }
      }
    },
  },
  plugins: [],
}
