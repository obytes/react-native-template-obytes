import type { ConfigContext, ExpoConfig } from '@expo/config';

import { Config } from './config/config.js';
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Config.name,
  description: `${Config.name} Mobile App`,
  slug: 'obytesapp',
  version: Config.version.toString(),
  orientation: 'portrait',
  icon: Config.icon,
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.jpg',
    resizeMode: 'cover',
    backgroundColor: '#F75469',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Config.scheme,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: Config.foregroundImage,
      backgroundColor: '#FFFFFF',
    },
    package: Config.scheme,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [['@bacons/link-assets', ['./assets/fonts/Inter.ttf']]],
});
