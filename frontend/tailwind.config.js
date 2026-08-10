/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16211F",
        muted: "#5C6B67",
        canvas: "#F6F7F5",
        surface: "#FFFFFF",
        border: "#DCE3DF",
        teal: {
          50: "#EAF3F1",
          100: "#CFE4DF",
          400: "#1F8A70",
          600: "#146157",
          700: "#114B45",
          900: "#0B302C",
        },
        clay: {
          50: "#FBEEE8",
          400: "#C25A34",
          600: "#9C4527",
        },
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
