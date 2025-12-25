/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "main-text" : ['Lato', 'sans-serif'],
        "main": ['Caladea', 'serif'],
        "sub": ['Share Tech Mono', 'monospace']
      },
      colors: {
        "primary" : "#08bb69", // text and bg-colors for butttons and etc.
        "secondary" : "#f7d91b", // for products and forms back ground
        "card" : "#f4f4fc", // for products and forms back ground
        "yellow": "#fffdf6",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        scroll: "scroll 25s linear infinite",
      },
    },
  },
  plugins: [],
}