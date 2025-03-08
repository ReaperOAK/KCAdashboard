// If you're using Create React App, you'll need to eject first or use craco for this

module.exports = {
  // ... other webpack config ...
  
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
