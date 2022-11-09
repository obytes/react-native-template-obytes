const packageJSON = require('../package.json');

// default values
const APP_ENV = process.env.APP_ENV ?? 'development';
const SCHEME = 'com.obytes';
const APP_NAME = 'ObytesApp';

const development = {
  APP_ENV: 'development',
  name: APP_NAME,
  scheme: `${SCHEME}.development`,
  icon: './assets/icon.development.jpeg',
  foregroundImage: './assets/icon.development.jpeg',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};

const staging = {
  APP_ENV: 'staging',
  name: APP_NAME,
  scheme: `${SCHEME}.staging`,
  icon: './assets/icon.staging.jpeg',
  foregroundImage: './assets/icon.staging.jpeg',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};
const production = {
  APP_ENV: 'production',
  name: APP_NAME,
  scheme: `${SCHEME}`,
  icon: './assets/icon.jpeg',
  foregroundImage: './assets/icon.jpeg',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};

const configs = { development, staging, production };

const Config = configs[APP_ENV];
module.exports = { Config };
