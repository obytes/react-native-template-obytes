const path = require('path');
const APP_ENV = process.env.APP_ENV ?? 'development';
const envPath = path.resolve(__dirname, `.env.${APP_ENV}`);

module.exports = function (api) {
  api.cache(true);

  require('dotenv').config({
    path: envPath,
  });

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-dotenv', { path: envPath }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@env': './env',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      ['nativewind/babel', { mode: 'compileOnly' }],
      'react-native-reanimated/plugin',
    ],
  };
};
