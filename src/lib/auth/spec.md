# Auth Library — current behavior

## What this feature does
A thin MMKV-backed token store left over from the pre-Clerk auth flow. It is
**currently unused**: nothing in `src/` imports it. Clerk's token cache
(`@clerk/expo/token-cache`, backed by `expo-secure-store`) superseded it, and
Clerk is the single source of session truth.

## Behavior
- `src/lib/auth/utils.tsx` exports exactly three functions over `@/lib/storage`
  (MMKV), all keyed on the string `'token'`:
  - `getToken()` — reads the stored `TokenType`, or `null` when absent.
  - `setToken(value)` — writes a `TokenType`.
  - `removeToken()` — deletes the key.
- `TokenType` is `{ access: string; refresh: string }`.
- The module does not talk to Clerk. It exports no `signOut()`, no session
  accessor, and no refresh logic.

## Entry points
- None. No file in `src/` imports from `@/lib/auth`.
- Sign-out is Clerk's `signOut()`, reached through `useAuth()` in
  `features/settings/settings-screen.tsx` and through `getClerkInstance()` in
  `src/lib/api/client.tsx`.

## Platform differences
- None. MMKV behaves identically on iOS and Android.

## Out of scope
- Token refresh — Clerk handles it.
- Session persistence — handled by Clerk's `tokenCache`, not by this module.
