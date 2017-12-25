export default (env) => {
  const path = `./config/webpack/${env}.js`;
  console.log('Webpack config:', path); // eslint-disable-line
  const getCurrentWebpackConfig = require(path);  // eslint-disable-line
  return getCurrentWebpackConfig();
};
