/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          ink: '#163300',
          dark: '#0e2000',
          light: '#234f00'
        },
        lime: {
          voltage: '#9fe870',
          hover: '#8ed960',
          dim: '#8cd45f'
        },
        spruce: '#054d28',
        linen: {
          mist: '#e2f6d5',
          light: '#f1faeb'
        },
        signal: {
          blue: '#0b4c72',
          light: '#e1f0fa'
        },
        alarm: {
          red: '#cb272f',
          light: '#fde8e9'
        },
        charcoal: '#454745',
        obsidian: '#0e0f0c',
        pebble: '#868685',
        slate: '#6a6c6a',
        fog: '#e8ebe6',
        paper: '#ffffff',
      },
      borderRadius: {
        'card': '10px',
        'input': '10px',
        'largeCard': '28px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        display: ['Inter', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'subtle': 'rgba(14, 15, 12, 0.12) 0px 0px 0px 1px',
        'card': '0 2px 10px rgba(22, 51, 0, 0.05), 0 0 1px rgba(22, 51, 0, 0.15)',
        'elevated': '0 12px 30px -10px rgba(22, 51, 0, 0.15)',
        'darkCard': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
