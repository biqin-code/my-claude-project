/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#904568",
        "primary-container": "#ffb1d0",
        "on-primary": "#ffffff",
        "on-primary-container": "#833a5c",
        secondary: "#665b63",
        "secondary-container": "#eedee8",
        tertiary: "#6f5767",
        "tertiary-container": "#ddbfd2",
        surface: "#fff7fe",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fbf0ff",
        "surface-container": "#f7e9fd",
        "surface-container-high": "#f1e4f7",
        "surface-container-highest": "#ebdef1",
        "surface-dim": "#e3d6e9",
        "on-surface": "#201926",
        "on-surface-variant": "#4f444a",
        background: "#fff7fe",
        catering: "#FF6B6B",
        transport: "#4ECDC4",
        shopping: "#FFE66D",
        entertainment: "#95E1D3",
        housing: "#F38181",
        medical: "#AA96DA",
        education: "#FCBAD3",
        others: "#A8D8EA",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#ba1a1a",
        outline: "#81737a",
        "outline-variant": "#d3c2ca"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
}
