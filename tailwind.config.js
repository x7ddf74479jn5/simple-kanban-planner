module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#5222d0",
        secondary: "#ec615b",
      },
      gridAutoColumns: {
        270: "270px",
        220: "220px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
