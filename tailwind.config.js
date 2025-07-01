module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
        },
        // Text
        text: {
          light: '#1a1740', // new: dark for light bg
          neutral: '#ffffff',
        },
        // Grays
        gray: {
          light: '#b3b6c6', // new: softer for dark mode
        },
        // Alerts
        error: {
          DEFAULT: '#e53935',
        },
        success: {
          DEFAULT: '#43a047',
        },
        warning: {
          DEFAULT: '#ffa726',
        },
        info: {
          DEFAULT: '#1976d2',
        },
      },
    },
  },
  plugins: [],
};
