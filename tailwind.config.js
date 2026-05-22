 /** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        unbounded: ['Unbounded', 'sans-serif'],
        },
      

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },

      animation: {
        marquee: "marquee 50s linear infinite",
      },
    },
  },
  plugins: [],
};