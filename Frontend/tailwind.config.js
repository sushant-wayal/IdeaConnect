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
            border: '4px solid #C1EDCC',
            boxSizing: 'content-box'
          },
          '50%': {
            border: '10px solid #C1EDCC',
            boxSizing: 'content-box'
          },
        },
        'connecting-lg': {
          '0%, 100%': {
            border: '0px solid #C1EDCC',
            boxSizing: 'content-box'
          },
          '50%': {
            border: '20px solid #C1EDCC',
            boxSizing: 'content-box'
          },
        },
        'flying': {
          '0%': {
            transform: 'translate(0px)',
            opacity: 1
          },
          '25%': {
            transform: 'translate(-8px, 10px)',
            opacity: 1
          },
          '50%': {
            transform: 'translate(0px)',
            opacity: 1
          },
          '75%': {
            transform: 'translate(10px, -10px)',
            opacity: 0.2
          },
          '100%': {
            transform: 'translate(0px)',
            opacity: 1
          }
        }
      },
      animation: {
        'connecting-md': 'connecting-md 1s ease-in-out infinite',
        'connecting-lg': 'connecting-lg 1s ease-in-out infinite',
        'flying': 'flying 1.5s linear 1',
        'flying-infinite': 'flying 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}

