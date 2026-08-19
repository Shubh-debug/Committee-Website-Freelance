/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
          400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
          800: '#9A3412', 900: '#7C2D12',
        },
        gold: {
          100: '#FDF3D0', 200: '#FAE39C', 300: '#F5D06B', 400: '#EFBE44',
          500: '#D4AF37', 600: '#B8962B', 700: '#96781F',
        },
        maroon: {
          400: '#A93B45', 500: '#8E2530', 600: '#7B1F24', 700: '#64161C',
          800: '#4E0F14', 900: '#3B0A0E',
        },
        cream: { 50: '#FFFDF5', 100: '#FEF9EC', 200: '#FCF3DA', 300: '#F8E9C0' },
        deep: '#2A0A0E',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['"Tiro Devanagari Marathi"', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(244, 176, 56, 0.45)',
      },
    },
  },
  plugins: [],
};
