/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5E4078',
          dark: '#4A306D',
          deep: '#3A2258',
          light: '#7B5C95',
        },
        surface: {
          DEFAULT: '#F7F5FA',
          muted: '#F0EBF5',
          light: '#FAF8FC',
          line: '#EBE5F2',
          soft: '#D1C5E0',
          outline: '#C4B5D4',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { top: '0' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
};
