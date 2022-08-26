module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sitePurple: '#140027',
        darkPurple: '#0F001D',
        background: "#080A07",
        primary: "#8CDE44"
      },
      screens: {
        "specific": "1320px"
      },
      fontFamily: {
        archivo: "Archivo",
        archivoBlack: "Archivo Black",
        jangkuy: ['Archivo Black', 'serif']
      },
      backgroundImage: {
        pattern: "url('/images/Lizard Pattern.png')",
        glass: "url('/images/glass.png')",
        glassTwo: "url('/images/glass 2.png')"
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        TRITON: {
          primary: '#8CDE44',
          "primary-focus": "#8CDE44",
          "primary-content": "#181830",
          secondary: "#FDE047",
          "secondary-focus": "#FDE047",
          "secondary-content": "#ffffff",
          accent: "#8CDE44",
          "accent-focus": "#8CDE44",
          "accent-content": "#ffffff",
          neutral: "#0e1c1b",
          "neutral-focus": "#111122",
          "neutral-content": "#ffffff",
          "base-100": "#FDE047",
          "base-200": "#ffffff",
          "base-300": "#A134FE",
          "base-content": "#000000",
          info: "#2094f3",
          success: "#009485",
          warning: "#ff9900",
          error: "#ff5724",
          "--border-color": "#8CDE44",
          "--rounded-box": ".1rem",
          "--rounded-btn": "0.1rem",
          "--rounded-badge": "0.1rem",
          "--animation-btn": "0.25s",
          "--animation-input": ".2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.1rem",
        },
      },
    ],
  },
};
