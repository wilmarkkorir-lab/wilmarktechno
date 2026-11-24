export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D',
        leaf: '#0B8A5F',
        flag: '#D7263D',
        sun: '#FFB703',
        sky: '#3A86FF',
        mist: '#F3F6FB',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      screens: { xs: '475px' },
    },
  },
  plugins: [],
}
