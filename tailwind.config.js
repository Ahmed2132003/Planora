/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3A86FF',
          dark: '#4CC9F0',
        },
        secondary: {
          light: '#FFBE0B',
          dark: '#F4A261',
        },
        background: {
          light: '#F9FAFB',
          dark: '#121212',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E1E1E',
        },
        text: {
          light: '#1F2937',
          dark: '#E5E7EB',
        },
        'text-secondary': {
          light: '#6B7280',
          dark: '#9CA3AF',
        },
        accent: {
          light: '#FF006E',
          dark: '#F72585',
        },
        success: {
          light: '#06D6A0',
          dark: '#2A9D8F',
        },
        warning: {
          light: '#FFD166',
          dark: '#E9C46A',
        },
        danger: {
          light: '#EF233C',
          dark: '#E63946',
        },
      },
    },
  },
  plugins: [],
};