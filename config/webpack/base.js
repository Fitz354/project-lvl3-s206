import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackIncludeAssetsPlugin from 'html-webpack-include-assets-plugin';
import path from 'path';

export default () => ({
  entry: './src/index.js',
  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/bootstrap/dist/css', to: 'css/' },
      { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/' },
    ]),
    new HtmlWebpackPlugin({
      title: 'RSS Reader',
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['css/bootstrap.min.css'],
      append: true,
    }),
  ],
  output: {
    path: path.join(__dirname, '../..', 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['env', {
                modules: false,
                targets: {
                  uglify: true,
                },
                useBuiltIns: true,
              }],
              'stage-0',
            ],
            plugins: ['syntax-dynamic-import'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
