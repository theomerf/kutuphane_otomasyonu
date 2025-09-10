/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
        'shine-gradient': "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)",
      },
      fontFamily: {
        segoe: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      }
    },
  },
  plugins: [
      require('@tailwindcss/line-clamp'),
  ],
}

