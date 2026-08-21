# Onboarding — decisions

## 2026-08-14 — MMKV for first-time flag
**Chose:** react-native-mmkv with `useMMKVBoolean` hook
**Over:** AsyncStorage
**Why:** MMKV is synchronous, so the flag is available before first render. AsyncStorage is async and causes flash of onboarding screen.
**Trade-off:** MMKV requires native module (already in deps); slightly larger bundle.

## 2026-08-14 — Notification permission at end of onboarding
**Chose:** Request at final onboarding step with context
**Over:** Request on app launch
**Why:** Users are more likely to grant permission after seeing value proposition.
**Trade-off:** Some users may skip onboarding and never grant permission.
