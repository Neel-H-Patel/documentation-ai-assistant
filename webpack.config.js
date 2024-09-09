const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/webview/index.js', // React entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Output bundle
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Transpile both .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Handle both JS and JSX files
  },
  devtool: 'source-map', // Optional, useful for debugging
};
