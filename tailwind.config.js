// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        majorelle: "#582CDB",
        electricGreen: "#0BCF00",
        "majorelle-light": "#EDEBFF",
        "green-accent-light": "#E8FFE8",
        "green-accent": "#0BCF00"
      },
      animation: {
        slideFade: "slideFade 0.4s ease-out"
      },
      keyframes: {
        slideFade: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: [],
};
