/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This enables dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'primary': '#3490dc',
        'secondary': '#ffed4a',
        // Dark mode colors
        'dark-primary': '#90cdf4',
        'dark-secondary': '#faf089',
      },
    },
  },
  plugins: [],
}