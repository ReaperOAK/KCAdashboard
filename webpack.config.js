// If you're using Create React App, you'll need to eject first or use craco for this

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
      
      // Enable production optimizations
      if (env === 'production') {
        // Optimize chunk splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  // Get the name. E.g. node_modules/packageName/not/this/part.js
                  // or node_modules/packageName
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `npm.${packageName.replace('@', '')}`;
                },
              },
            },
          },
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
            }),
          ],
        };
        
        // Add compression plugin to gzip the bundles
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );
        
        // Add bundle analyzer plugin (disabled by default, uncomment to use)
        // webpackConfig.plugins.push(new BundleAnalyzerPlugin());
      }
      
      return webpackConfig;
    },
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      fs: false,
      path: false,
    },
    alias: {
      'lichess-pgn-viewer': require.resolve('lichess-pgn-viewer')
    }
  },
  
  module: {
    rules: [
      // ... other rules ...
      
      // Handle CSS imports from the lichess-pgn-viewer package
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
