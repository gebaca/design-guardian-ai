/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#534AB7',
          'primary-hover': '#3C3489',
          'primary-subtle': '#EEEDFE',
          'primary-text': '#26215C',
        },
        neutral: {
          900: '#2C2C2A',
          700: '#5F5E5A',
          100: '#D3D1C7',
          50: '#F1EFE8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
};
