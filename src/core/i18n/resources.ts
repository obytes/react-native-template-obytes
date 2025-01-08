import en from '@/translations/en.json';

export const resources = {
  en: {
    translation: en,
  },
};

export type Language = keyof typeof resources;
