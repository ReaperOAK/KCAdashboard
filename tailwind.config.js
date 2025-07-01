module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Main brand colors (unchanged)
        primary: '#200e4a',
        secondary: '#461fa3',
        accent: '#7646eb',
        highlight: '#af0505',
        // Backgrounds
        background: {
          light: '#f3f1f9',
          // Much deeper, less saturated, more neutral for dark mode
          dark: '#18192b', // new: deep blue-gray, not pure black
        },
        // Text
        text: {
          dark: '#e3e1f7', // new: light for dark bg
          light: '#1a1740', // new: dark for light bg
          neutral: '#ffffff',
        },
        // Grays
        gray: {
          light: '#b3b6c6', // new: softer for dark mode
          dark: '#23243a', // new: much darker for dark mode
        },
        // Alerts
        error: {
          DEFAULT: '#e53935',
          dark: '#b71c1c',
        },
        success: {
          DEFAULT: '#43a047',
          dark: '#1b5e20',
        },
        warning: {
          DEFAULT: '#ffa726',
          dark: '#ff6f00',
        },
        info: {
          DEFAULT: '#1976d2',
          dark: '#0d47a1',
        },
      },
    },
  },
  plugins: [],
};
