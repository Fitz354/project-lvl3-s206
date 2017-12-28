import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import precss from 'precss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default () => ({
  entry: './src/js/index.js',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new HtmlWebpackPlugin({
      title: 'RSS Reader',
      template: 'src/index.html',
    }),
    new ExtractTextPlugin('css/style.css'),
  ],
  output: {
    path: path.join(__dirname, '../..', 'dist'),
    filename: 'js/main.js',
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
                  browsers: ['last 2 Chrome versions'],
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
        test: /\.(scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader' },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  precss,
                  autoprefixer,
                ],
              },
            },
            {
              loader: 'sass-loader',
            }],
        }),
      },
    ],
  },
});
