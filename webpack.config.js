// If you're using Create React App, you'll need to eject first or use craco for this

const path = require('path');

module.exports = {
  // Extend the existing webpack configuration
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Exclude stockfish directory from webpack processing
      webpackConfig.module.rules.forEach(rule => {
        if (rule.oneOf) {
          rule.oneOf.forEach(loader => {
            if (loader.exclude) {
              if (Array.isArray(loader.exclude)) {
                loader.exclude.push(/public\/stockfish/);
              } else {
                loader.exclude = [loader.exclude, /public\/stockfish/];
              }
            }
          });
        }
      });
      
      return webpackConfig;
    },
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      fs: false,
      path: false,
    }
  },
  
  module: {
    rules: [
      // ... other rules ...
      
      // Handle CSS imports
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
