import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import 'tsx/cjs';

// eslint-disable-next-line perfectionist/sort-imports
import Env from './env';

const EXPO_ACCOUNT_OWNER = 'rionna_ireland';
const EAS_PROJECT_ID = '4b0041b1-d0cb-4d08-96f1-ef2ef7dda3b3';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.EXPO_PUBLIC_APP_ENV !== 'production',
  badges: [
    {
      text: Env.EXPO_PUBLIC_APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.EXPO_PUBLIC_VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

const CALENDAR_PERMISSION = 'Allow Rionna to add club events to your calendar.';
const REMINDERS_PERMISSION = 'Allow Rionna to access reminders when adding club events.';
const PHOTOS_PERMISSION = 'Rionna uses your photos so you can attach one to a post.';

const plugins: ExpoConfig['plugins'] = [
  [
    'expo-splash-screen',
    {
      backgroundColor: '#391d3a',
      image: './assets/splash-icon.png',
      imageWidth: 150,
    },
  ],
  [
    'expo-font',
    {
      ios: {
        fonts: [
          'assets/fonts/PPEiko-Thin.otf',
          'assets/fonts/PPEiko-LightItalic.otf',
          'assets/fonts/PPEiko-Medium.otf',
          'assets/fonts/PPEiko-Heavy.otf',
          'assets/fonts/PPEiko-BlackItalic.otf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf',
          'node_modules/@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf',
        ],
      },
      android: {
        fonts: [
          {
            fontFamily: 'PPEiko',
            fontDefinitions: [
              { path: 'assets/fonts/PPEiko-Thin.otf', weight: 100 },
              { path: 'assets/fonts/PPEiko-Medium.otf', weight: 500 },
              { path: 'assets/fonts/PPEiko-Heavy.otf', weight: 800 },
            ],
          },
          {
            fontFamily: 'PlusJakartaSans',
            fontDefinitions: [
              { path: 'node_modules/@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf', weight: 400 },
              { path: 'node_modules/@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf', weight: 500 },
              { path: 'node_modules/@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf', weight: 600 },
              { path: 'node_modules/@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf', weight: 700 },
            ],
          },
          {
            fontFamily: 'IBMPlexMono',
            fontDefinitions: [
              { path: 'node_modules/@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf', weight: 400 },
            ],
          },
        ],
      },
    },
  ],
  'expo-localization',
  'expo-notifications',
  'expo-router',
  [
    'expo-calendar',
    {
      calendarPermission: CALENDAR_PERMISSION,
      remindersPermission: REMINDERS_PERMISSION,
    },
  ],
  [
    'expo-image-picker',
    {
      photosPermission: PHOTOS_PERMISSION,
    },
  ],
  ['app-icon-badge', appIconBadgeConfig],
  ['react-native-edge-to-edge'],
];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  description: `${Env.EXPO_PUBLIC_NAME} Mobile App`,
  owner: EXPO_ACCOUNT_OWNER,
  scheme: Env.EXPO_PUBLIC_SCHEME,
  slug: 'rionna',
  version: Env.EXPO_PUBLIC_VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
    // Preview/staging IPAs must not auto-apply OTAs. `eas update` from a
    // checkout with `.env` → localhost will silently replace the baked
    // staging API URL; the phone then dies with axios "Network Error".
    checkAutomatically:
      Env.EXPO_PUBLIC_APP_ENV === 'production' ? 'ON_LOAD' : 'NEVER',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // iOS 17+ EventKit reads these in ExpoCalendar's OnCreate. Missing keys
      // are RCTFatal, not a JS exception — cannot be caught in add-to-calendar.ts.
      NSCalendarsUsageDescription: CALENDAR_PERMISSION,
      NSCalendarsFullAccessUsageDescription: CALENDAR_PERMISSION,
      NSRemindersUsageDescription: REMINDERS_PERMISSION,
      NSRemindersFullAccessUsageDescription: REMINDERS_PERMISSION,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#391d3a',
    },
    package: Env.EXPO_PUBLIC_PACKAGE,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins,
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
});
