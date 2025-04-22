const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    alias: { '@urls': path.resolve('../backend/urls') },
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: true,
    static: path.join(__dirname, 'public'),
    port: 8085,
    compress: true,
    server: {
      type: 'https',
      options: {
        key: process.env.NODE_ENV === 'production' ? '' : fs.readFileSync(path.resolve(__dirname, '../server.key')),
        cert: process.env.NODE_ENV === 'production' ? '' : fs.readFileSync(path.resolve(__dirname, '../server.cert'))
      }
    }
  }
};
