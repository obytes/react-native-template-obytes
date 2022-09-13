/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato-Regular'],
        'lato-medium': ['Lato-Medium'],
        'lato-semibold': ['Lato-Semibold'],
        'lato-bold': ['Lato-Bold'],
      },
      colors: {
        primary: {
          50: '#fff6f8',
          100: '#feeef0',
          200: '#fdd4da',
          300: '#fcbac3',
          400: '#f98796',
          500: '#F75369',
          600: '#de4b5f',
          700: '#b93e4f',
          800: '#94323f',
          900: '#792933',
        },
        secondary: {
          50: '#f4faf6',
          100: '#e9f6ed',
          200: '#c7e7d2',
          300: '#a5d9b7',
          400: '#62bd81',
          500: '#1FA04B',
          600: '#1c9044',
          700: '#177838',
          800: '#13602d',
          900: '#0f4e25',
        },
        gray: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fefefe',
          300: '#fdfdfd',
          400: '#fbfbfb',
          500: '#f9f9f9',
          600: '#e0e0e0',
          700: '#bbbbbb',
          800: '#959595',
          900: '#7a7a7a',
        },
      },
    },
  },
  plugins: [],
};
