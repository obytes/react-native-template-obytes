# Auth — decisions

## 2026-08-20 — Migrated to Clerk for authentication
**Chose:** @clerk/expo + @clerk/react
**Over:** Custom JWT + MMKV token storage (previous implementation)
**Why:** Clerk handles session management, MFA, device verification, and token refresh out of the box. Reduces custom auth code surface area.
**Trade-off:** Additional dependency; vendor lock-in for auth; requires Clerk account and publishable key.

## 2026-08-20 — Removed custom token storage
**Chose:** Rely on Clerk SDK for session persistence
**Over:** MMKV storage for access/refresh tokens
**Why:** Clerk manages secure token storage internally; avoids duplicating token logic.
**Trade-off:** Less control over storage mechanism; must trust Clerk's security model.

## 2026-08-21 — Clerk as the only source of session truth
**Chose:** Read session state directly from Clerk (`useAuth()`, `getClerkInstance()`) and delete `features/auth/use-auth-store.tsx`
**Over:** Keeping a Zustand `isSignedIn` store mirrored from Clerk callbacks
**Why:** The store held a copy of state Clerk already owns, which is the duplication CLAUDE.md forbids ("never the same data in both"). Two sources drift: a 401 sign-out from the API interceptor never reached the store, so the guard could still believe the user was signed in.
**Trade-off:** No synchronous, module-scope way to read "am I signed in" any more. Every consumer must be inside `ClerkProvider` and must handle the `isLoaded === false` window explicitly — the `(app)` guard now renders `null` during session restore instead of deciding immediately.

## 2026-08-21 — Future sign-in API (`signIn.password()` + `finalize()`)
**Chose:** `signIn.password({ emailAddress, password })` followed by `signIn.finalize({ navigate })`
**Over:** The legacy `signIn.create({ identifier, password })` + `setActive({ session })` flow
**Why:** The future API returns `{ error }` instead of throwing, so failures are ordinary values rather than control flow, and `finalize()` activates the session and navigates in one step — with `create()` alone the status reaches `complete` with no active session and the route guard bounces the user back to `/login`.
**Trade-off:** A newer, less widely documented API surface that is still evolving, and it is error-prone in a specific way: `try/catch` around `signIn.password()` silently catches nothing, so every call site must branch on the returned `error`. Pinning `@clerk/expo` matters more as a result.
