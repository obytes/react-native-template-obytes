# Onboarding — current behavior

## What this feature does
First-run user onboarding flow: welcome screen, feature highlights, and permission requests.

## Behavior
- Onboarding screen displays swipeable pages with feature highlights.
- On completion, sets `isFirstTime = false` in MMKV via `use-is-first-time` hook.
- Requests notification permission at appropriate step (see decisions.md).
- Skipped if `isFirstTime` is already false.

## Entry points
- Route: `src/app/onboarding.tsx` → `features/onboarding/onboarding-screen.tsx`
- State: MMKV via `use-is-first-time` hook (client state)

## Platform differences
- iOS: Uses `expo-notifications` for permission request with custom alert.
- Android: Uses standard notification permission dialog.

## Out of scope
- Personalized onboarding based on user segment — deferred.
