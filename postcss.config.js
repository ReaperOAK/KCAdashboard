module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // More aggressive CSS optimization in production
    ...(process.env.NODE_ENV === 'production'
      ? [
          require('@fullhuman/postcss-purgecss')({
            content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            // Use a more specific safelist to reduce CSS size
            safelist: {
              standard: [/^bg-/, /^text-/, /^border-/],
              deep: [/chess/, /pgn/, /ant-/, /mui/],
              // Don't use greedy patterns - be more specific
              variables: [':root'],
            },
            // Additional PurgeCSS options for better optimization
            fontFace: true,
            keyframes: true,
            rejected: false, // Set to true to see rejected CSS
          }),
          require('cssnano')({
            preset: [
              'advanced', // Use advanced preset for more aggressive optimization
              {
                discardComments: {
                  removeAll: true,
                },
                discardDuplicates: true,
                discardEmpty: true,
                discardUnused: true,
                cssDeclarationSorter: true,
                mergeIdents: true,
                reduceIdents: true,
                zindex: false,
                minifyFontValues: true,
                minifyGradients: true,
                normalizeUrl: true,
                mergeLonghand: true,
                mergeRules: true,
                // Be careful with selectors to preserve functionality
                colormin: true,
              },
            ],
          }),
        ]
      : []),
  ],
};