/*
 * Be careful, this file should be imported on you src folder.
 * should only imported in app.config.ts (in the build phase)
 * to get access to the env variables in your code use the Env file from the src folder
 * example: import  Env  from '@env'
 */
const z = require('zod');

const packageJSON = require('./package.json');
const path = require('path');
const APP_ENV = process.env.APP_ENV ?? 'development';
const envPath = path.resolve(__dirname, `.env.${APP_ENV}`);

// load env variables from .env file based on the APP_ENV
require('dotenv').config({
  path: envPath,
});

/**
 *  First part: Define your env variables
 *  Static variable for your app such as: bundle id, package name, app name, etc.
 *  you can add them to the .env file but we think it's better to keep them here.
 *
 * We declare a function withEnvSuffix that will add a suffix to the variable name based on the APP_ENV
 *
 */

const BUNDLE_ID = 'com.obytes'; // ios bundle id
const PACKAGE = 'com.obytes'; // android package name
const NAME = 'ObytesApp'; // app name

/**
 * Add a suffix to variable env based on APP_ENV
 * @param {string} name
 * @returns  {string}
 */

const withEnvSuffix = (name) => {
  return APP_ENV === 'production' ? name : `${name}.${APP_ENV}`;
};

/**
 *  2nd part: Define your env variables schema
 *  when ever you want to add a new variable, you should add it to the clientVars object or the buildTimeVars object
 *  Note : z.string() means that the variable is only exists and can be an empty string but not undefined.
 *  if you want to make the variable required you should use z.string().min(1) instead.
 *  Read more about zod here: https://zod.dev/?id=strings
 *
 */

// Add your variables here if you want to use it in your src code + build time (client side)
const clientVars = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  NAME: z.string(),
  BUNDLE_ID: z.string(),
  PACKAGE: z.string(),
  VERSION: z.string(),

  // ADD YOUR ENV VARS HERE
  API_URL: z.string(),
});

// add you vars here if you want to use it only in the build time (app.config.ts)
const buildTimeVars = z.object({
  SECRET_KEY: z.string(),
});

/**
 * @type {Record<keyof z.infer<typeof clientVars> , string | undefined>}
 */
const _clientVars = {
  APP_ENV,
  NAME: NAME,
  BUNDLE_ID: withEnvSuffix(BUNDLE_ID),
  PACKAGE: withEnvSuffix(PACKAGE),
  VERSION: packageJSON.version,

  // ADD YOUR ENV VARS HERE TOO
  API_URL: process.env.API_URL,
};

/**
 * @type {Record<keyof z.infer<typeof buildTimeVars> , string | undefined>}
 */
const _buildTimeVars = {
  SECRET_KEY: process.env.SECRET_KEY,
};

/**
 * 3rd part: Merge and Validate your env variables
 * we use zod to validate our env variables
 * if the validation fails we throw an error and log the error to the console
 * if the validation passes we export the env variables
 * you can access the env variables by importing the Env object from this file
 * example: import { Env } from '@env'
 **/
const _env = {
  ..._clientVars,
  ..._buildTimeVars,
};

const merged = buildTimeVars.merge(clientVars);
const parsed = merged.safeParse(_env);

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,

    `\n❌ Missing variables in .env.${APP_ENV} file, Make sure all required variables are defined in the .env.${APP_ENV} file.`,
    `\n💡 Tip: If you recently updated the .env.${APP_ENV} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`
  );
  throw new Error(
    'Invalid environment variables, Check terminal for more details '
  );
}

const Env = parsed.data;
const ClientEnv = clientVars.parse(_clientVars);

module.exports = {
  Env,
  ClientEnv,
  withEnvSuffix,
};
