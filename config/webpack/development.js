const path = require('path');
const webpackMerge = require('webpack-merge');
const getBaseConfig = require('./base');

module.exports = () => webpackMerge(getBaseConfig(), {
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../..', 'dist'),
  },
});
