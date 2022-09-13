import type { resources } from './index';

// react-i18next versions higher than 11.11.0

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en'];
  }
}
