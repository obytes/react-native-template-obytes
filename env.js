const z = require('zod');

const packageJSON = require('./package.json');

// TODO: Change this to your app's name
const BUNDLE_ID = 'com.obytes'; // ios bundle id
const PACKAGE = 'com.obytes'; // android package name
const NAME = 'ObytesApp'; // app name
const APP_ENV = process.env.APP_ENV ?? 'development';

const envVars = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  NAME: z.string(),
  BUNDLE_ID: z.string(),
  PACKAGE: z.string(),
  VERSION: z.string(),

  // ADD YOUR ENV VARS HERE
  API_URL: z.string(),
});

/**
 * Add a suffix to variable env based on APP_ENV
 * @param {string} name
 * @returns  {string}
 */

const withEnvSuffix = (name) => {
  return APP_ENV === 'production' ? name : `${name}.${APP_ENV}`;
};

/**
 * @type {Record<keyof z.infer<typeof envVars> , string | undefined>}
 */
const _env = {
  APP_ENV,
  NAME: NAME,
  BUNDLE_ID: withEnvSuffix(BUNDLE_ID),
  PACKAGE: withEnvSuffix(PACKAGE),
  VERSION: packageJSON.version,
  API_URL: process.env.API_URL,
};

const parsed = envVars.safeParse(_env);

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,

    `\n❌ Missing variables in .env.${APP_ENV} file
Make sure all required variables are defined in the .env.${APP_ENV} file.`,
    `\n💡 Tip: If you recently updated the .env.${APP_ENV} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`
  );
  throw new Error(
    'Invalid environment variables, Check terminal for more details '
  );
}

const Env = parsed.data;

module.exports = {
  Env,
  withEnvSuffix,
};
