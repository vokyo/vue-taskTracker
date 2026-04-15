/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        priority: {
          urgent: '#E24B4A',
          high: '#D85A30',
          medium: '#BA7517',
          low: '#639922',
        },
        status: {
          todo: '#888780',
          in_progress: '#378ADD',
          completed: '#639922',
          cancelled: '#E24B4A',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      gridTemplateColumns: {
        '70/30': '70% 28%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
