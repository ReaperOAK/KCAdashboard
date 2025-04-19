/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Your custom theme extensions
    },
  },
  plugins: [require('@tailwindcss/forms')],
  // Simplified safelist to avoid warnings
  safelist: [
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^border-/ },
  ],
  // Reduce CSS size by limiting variants and classes
  corePlugins: {
    // Disable less commonly used features
    container: false,
    objectFit: false,
    objectPosition: false,
    overscroll: false,
    placeholderColor: false,
    placeholderOpacity: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
  },
};
