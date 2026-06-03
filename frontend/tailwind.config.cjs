/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        primary: '#DC2626',
        secondary: '#F8FAFC',
        text: '#111827',
        mutedText: '#6B7280',
      },
    },
  },
  plugins: [],
}
