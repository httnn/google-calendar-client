require('dotenv').config();
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: process.env.NODE_ENV || 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      googleClientId: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
      googleApiKey: JSON.stringify(process.env.GOOGLE_API_KEY)
    })
  ]
};
