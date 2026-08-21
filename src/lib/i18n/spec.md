# i18n — current behavior

## What this feature does
Internationalization setup: locale detection, translation loading, RTL support, and translation hook.

## Behavior
- Locales: English (`en.json`) and Arabic (`ar.json`) in `src/translations/`.
- `useTranslation` hook provides `t(key)` function and `locale` state.
- Locale persisted in MMKV via `use-selected-language` hook.
- RTL layout automatically applied for Arabic via `I18nManager.forceRTL`.

## Entry points
- Provider: `src/lib/i18n/provider.tsx` wraps app.
- Hook: `useTranslation` from `src/lib/i18n/hooks.ts`.
- Utils: `src/lib/i18n/utils.tsx` for locale detection/persistence.

## Platform differences
- iOS: RTL requires `I18nManager.forceRTL` + app reload.
- Android: RTL works without reload.

## Out of scope
- Dynamic locale loading (all locales bundled).
- Pluralization rules beyond simple key lookup.
