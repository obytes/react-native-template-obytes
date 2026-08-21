# Settings — current behavior

## What this feature does
A scrolling settings screen: theme and language pickers, read-only app info,
support/links rows, and a logout row.

## Behavior
- Theme: `ThemeItem` opens an `Options` bottom sheet with Dark / Light / System
  and writes the choice through `useSelectedTheme` (MMKV + `Uniwind.setTheme`).
- Language: `LanguageItem` opens an `Options` bottom sheet with English /
  Arabic and writes the choice through `useSelectedLanguage` from `@/lib/i18n`.
- About rows show `Env.EXPO_PUBLIC_NAME` and `Env.EXPO_PUBLIC_VERSION`.
- Support and Links rows (share, rate, support, privacy, terms, github,
  website) are rendered with no-op `onPress` handlers — they are placeholders.
- Logout calls Clerk's `signOut()` from `useAuth()`. The screen performs no
  navigation itself: the `(app)` route guard sees `isSignedIn` turn false and
  redirects to `/login`. If `signOut()` rejects, a flash error message is shown
  using `settings.logout_failed` and the error is logged.
- Icon tint follows the active Uniwind theme (`colors.neutral[400]` in dark,
  `colors.neutral[500]` in light).

## Entry points
- Route: `src/app/(app)/settings.tsx` → `features/settings/settings-screen.tsx`
- State: MMKV for theme, i18n storage for language, Clerk for session.

## Platform differences
- None.

## Out of scope
- Account deletion — not implemented.
- Push notification preferences — deferred.
- Data export — deferred.
