/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',    
    './components/**/*.{ts,tsx,js,jsx}',   
  ],
  theme: {
    extend: {
      colors: {
        blackglass: 'rgba(20,22,28,0.8)',
      },
      boxShadow: {
        xl: '0 8px 32px 0 rgba(31, 38, 135, 0.19)',
      },
    },
  },
  plugins: [],
};
