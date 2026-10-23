/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pulp: {
          canvas: '#0D0F12',
          card: '#161920',
          'card-glass': 'rgba(22, 25, 32, 0.85)',
          'card-border': 'rgba(255, 255, 255, 0.08)',
          gold: '#D99738',
          'gold-light': '#E5A852',
          'gold-dark': '#B87A24',
          cream: '#FDFBF9',
          surface: '#161920',
          'surface-warm': '#1B1E26',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.05)',
          coral: '#F95D4A',
          'coral-light': '#FFF0ED',
          'coral-dark': '#D94432',
          lime: '#70B814',
          'lime-light': '#F2F9E8',
          'lime-dark': '#4D820C',
          amber: '#F59E0B',
          'amber-light': '#FEF8EA',
          'amber-dark': '#B45309',
          teal: '#0D9488',
          'teal-light': '#EEFBF8',
          purple: '#8B5CF6',
          'purple-light': '#F5F3FF',
          dark: '#0D0F12',
          muted: '#9CA3AF',
        }
      },
      boxShadow: {
        'pulp-card': '0 8px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'pulp-hover': '0 16px 40px -8px rgba(0, 0, 0, 0.7), 0 0 15px 1px rgba(217, 151, 56, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'luxury-card': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'luxury-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(217, 151, 56, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
