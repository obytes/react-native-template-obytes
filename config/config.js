import { z } from 'zod';

const packageJSON = require('../package.json');

// default values
const SCHEME = 'com.obytes';
const APP_NAME = 'ObytesApp';

const vars = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  name: z.string(),
  scheme: z.string(),
  icon: z.string(),
  foregroundImage: z.string(),
  API_URL: z.string(),
  version: z.string(),
});
console.log(vars);

/** @typedef {z.infer<typeof vars>} ENVVarsType */
/** @typedef { 'development' | 'staging' | 'production' } ENVType */

/** @type {ENVVarsType} */
const development = {
  APP_ENV: 'development',
  name: APP_NAME,
  scheme: `${SCHEME}.development`,
  icon: './assets/icon.development.png',
  foregroundImage: './assets/icon.development.png',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};

/** @type {ENVVarsType} */
const staging = {
  APP_ENV: 'staging',
  name: APP_NAME,
  scheme: `${SCHEME}.staging`,
  icon: './assets/icon.staging.png',
  foregroundImage: './assets/icon.staging.png',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};
/** @type {ENVVarsType} */
const production = {
  APP_ENV: 'production',
  name: APP_NAME,
  scheme: `${SCHEME}`,
  icon: './assets/icon.png',
  foregroundImage: './assets/icon.png',
  API_URL: 'https://dummyjson.com/',
  version: packageJSON.version,
};

const configs = { development, staging, production };

/**
 * @param {keyof typeof configs} appEnv
 * @returns {ENVVarsType}
 * */

function getConfig(appEnv) {
  return configs[appEnv];
}

export { getConfig };
