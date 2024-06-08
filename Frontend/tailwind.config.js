/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'connecting-md': {
          '0%, 100%': {
            border: '4px solid rgba(0,255,0,0.7)',
            boxSizing: 'content-box'
          },
          '50%': {
            border: '10px solid rgba(0,255,0,0.7)',
            boxSizing: 'content-box'
          },
        },
        'connecting-lg': {
          '0%, 100%': {
            border: '0px solid rgba(0,255,0,0.7)',
            boxSizing: 'content-box'
          },
          '50%': {
            border: '20px solid rgba(0,255,0,0.7)',
            boxSizing: 'content-box'
          },
        }
      },
      animation: {
        'connecting-md': 'connecting-md 1s ease-in-out infinite',
        'connecting-lg': 'connecting-lg 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

