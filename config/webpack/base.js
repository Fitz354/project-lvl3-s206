import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default () => ({
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS Reader',
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
