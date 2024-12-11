/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          'pink': '#ff2a6d',
          'blue': '#05d9e8',
          'purple': '#7700ff',
          'dark': '#1a1a1a',
          'darker': '#0d0d0d'
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.cyber.blue), 0 0 20px theme(colors.cyber.blue)',
        'neon-pink': '0 0 5px theme(colors.cyber.pink), 0 0 20px theme(colors.cyber.pink)'
      }
    },
  },
  plugins: [],
}
