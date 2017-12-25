const webpackMerge = require('webpack-merge');
const getBaseConfig = require('./base');

module.exports = () => webpackMerge(getBaseConfig(), {
});
