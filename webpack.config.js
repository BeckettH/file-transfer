const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.join(__dirname, '/client/index.js'),
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js',
  },
  mode: process.env.NODE_ENV,
  target: 'node',
  devServer: {
    publicPath: path.join(__dirname, '/build'),
    proxy: {
      '/sign-s3': 'http://localhost:3000/',
      '/get-file': 'http://localhost:3000/',
    },
    port: 8080,
  },
  plugins: [
    new MiniCssExtractPlugin(
      {
        filename: 'styles.css',
      },
    ),
  ],
  module: {
    rules: [
      { // js and jsx loader
        test: /\.(js|jsx)?$/,
        exclude: /(node_modules)/,
        sideEffects: true,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      { // css loader
        test: /\.css$/i,
        use: [
          { // bundles the CSS into its own file
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, '/client/css/'),
            },
          },
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
        ],
      },
    ],
  },
};
