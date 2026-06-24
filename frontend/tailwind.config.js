/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:     '#003666',
        blue:     '#1473E6',
        'blue-l': '#EAF3FE',
        'blue-m': '#B8D5F7',
        green:    '#1E7E5E',
        'green-l':'#E8F7F2',
        red:      '#C5373E',
        'red-l':  '#FEF0F1',
        amber:    '#B86A00',
        'amber-l':'#FEF5E7',
        text:     '#1A1D23',
        'text-m': '#5A6070',
        'text-l': '#9299A8',
        border:   '#E2E4E9',
        bg:       '#F4F5F7',
        surface:  '#FFFFFF',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        bounce3: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%':           { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        bounce3: 'bounce3 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
