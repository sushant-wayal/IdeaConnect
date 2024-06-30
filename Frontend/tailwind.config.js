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
        },
        'uploading': {
          '0%': {
            transform: 'translateY(20px)',
          },
          '50%': {
            transform: 'translateY(0px)',
          },
          '100%': {
            transform: 'translateY(-2px)',
          }
        },
        'shake': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '33%': {
            transform: 'rotate(-10deg)',
          },
          '66%': {
            transform: 'rotate(10deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          }
        },
      },
      animation: {
        'connecting-md': 'connecting-md 1s ease-in-out infinite',
        'connecting-lg': 'connecting-lg 1s ease-in-out infinite',
        'flying': 'flying 1.5s linear 1',
        'flying-infinite': 'flying 1.5s linear infinite',
        'uploading': 'uploading 2s linear infinite',
        'shake': 'shake 0.25s linear 3',
      },
    },
  },
  plugins: [],
}

