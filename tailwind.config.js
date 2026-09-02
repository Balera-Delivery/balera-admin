/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#E0EBFF',
          200: '#C7D9FE',
          300: '#A4BFFC',
          400: '#7B9EF9',
          500: '#4F79F6',
          600: '#1B59F8', // Primary Balerra Royal Blue
          700: '#1347D4',
          800: '#1039AC',
          900: '#0F3087',
          950: '#0A1E58',
        },
        sidebar: {
          bg: '#FFFFFF',
          text: '#64748B',
          activeBg: '#1B59F8',
          activeText: '#FFFFFF',
          hoverBg: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
