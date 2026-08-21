# Auth Library — decisions

## 2026-08-20 — Removed custom token storage
**Chose:** Rely on Clerk SDK for session persistence
**Over:** MMKV storage for access/refresh tokens (previous implementation)
**Why:** Clerk manages secure token storage internally; avoids duplicating token logic and potential sync issues.
**Trade-off:** Less control over storage mechanism; must trust Clerk's security model.

## 2026-08-14 — MMKV for tokens (historical)
**Chose:** react-native-mmkv with encryption
**Over:** expo-secure-store
**Why:** SecureStore is async and blocked first paint on cold start (~180ms). MMKV is synchronous, so the store hydrates before the first render.
**Trade-off:** Weaker than Keychain-backed storage. Acceptable because refresh tokens are short-lived (7d) and revocable server-side.

## 2026-08-21 — Clerk token cache on expo-secure-store
**Chose:** `tokenCache` from `@clerk/expo/token-cache` (backed by `expo-secure-store`) passed to `ClerkProvider`
**Over:** Clerk's default in-memory cache, or re-pointing Clerk at the MMKV helpers in this module
**Why:** Without a persistent cache the session dies with the process and every cold start lands on `/login`. The bundled cache is Keychain/Keystore-backed and is the path Clerk tests and supports, so no custom storage adapter has to be kept correct.
**Trade-off:** `expo-secure-store` is a native module with a config plugin, so the app now needs a dev-client build and no longer runs in Expo Go. It also reverses the 2026-08-14 MMKV-over-SecureStore decision above and accepts SecureStore's async reads, which is why the route guard has to wait on `isLoaded`. The helpers in `utils.tsx` are left in place but are now dead code.
